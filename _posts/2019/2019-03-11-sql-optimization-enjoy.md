---
layout: post
title: "一次提速百倍的 SQL 优化记录"
description: "SQL 优化经验分享"
categories: [整理]
tags: [SQL, 优化]
redirect_from:
  - /2019/03/11/
---

为避免麻烦，文中涉及的表名、字段名、查询条件内容均通过脱敏，为便于阅读，命名通过修改修改，测试数据每张表的容量大小均在万行以上。

## 需求（权限相关过滤查询）

```
①预算角色（按项目成本中心+资源产品线对应的预算人）
③项目发起人、项目负责人、项目审批人（对象权限）
④资源联系人、资源审批人、结算数据查询人（对象权限）
```

## 优化前的 SQL

我们按需求循规蹈矩的写写试试：

```sql
-- 非权限类的查询用 1=1 代替来讲解
select p.* from t_project p
	where 1 = 1
	    -- ③项目发起人（项目表维度）
		and (p.responsible_id = 5336471
		-- ④资源联系人、资源审批人、结算数据查询人（对象权限）（项目资源表维度）
		or exists (select 1 from t_project_resource pr where pr.project_id = p.id
            and (pr.contact_user_emails like '%current_username@email.com%'
                or pr.amount_user_emails like '%current_username@email.com%'
                or pr.audit_user_emails like '%current_username@email.com%'
		-- ①预算（按产品线）（项目资源表+预算产品线表维度）
		    or exists (select 1 from t_productline_budgeteer where product_id = pr.productline_code and budgeteer_name = 'current_username')))
        -- ③项目发起人、项目负责人、项目审批人（对象权限）（项目审批流维度）
		or exists (select 1 from t_approval_process ap where object_id = p.id and object_class = 'xxx.xxx'
		    and exists (select 1 from t_approval_record ar where ar.workflow_process_id = ap.id and ar.deal_username = 'current_username'))
        -- ①预算（按 cc）（预算成本中心表维度）
		or exists (select 1 from t_costcenter_budgeteer where costcenter_id = p.costcenter_id and budgeteer_name = 'current_username'));
```

按好理解的业务逻辑写，<span style="color:red;">SQL 执行时间达到 （>35s）</span>：

1. 基本都是并列情况，or 太多（没法层层过滤）
2. 基本都是 in、exists（总是全表扫描）
3. 有很多 like （模糊查询，全表扫描）

## 优化尝试

### 通过分析 IN 和 EXISTS 的特性，用 IN 代替写

```
1、select * from A where id in (select id from B) --使用 in
2、select * from A where exists(select B.id from B where B.id=A.id) --使用 exists
3、select A.* from A,B where A.id=B.id --不使用 in 和 exists

具体使用时到底选择哪一个，主要考虑查询效率问题：
第一条语句使用了 A 表的索引；
第二条语句使用了 B 表的索引；
第三条语句同时使用了 A 表、B 表的索引；
如果 A、B 表的数据量不大，那么这三个语句执行效率几乎无差别；
如果 A 表大，B 表小，显然第一条语句效率更高，反之，则第二条语句效率更高；
```

```sql
-- 非权限类的查询用 1=1 代替来讲解
select p.* from t_project p
  where 1 = 1
    -- ③项目发起人（项目表维度）
    and (p.responsible_id = 5336471
    -- ④资源联系人、资源审批人、结算数据查询人（对象权限）（项目资源表维度）
    or p.id in (select  pr.project_id1 from t_project_resource pr where (
        pr.contact_user_emails like '%current_username@email.com%'
        or pr.amount_user_emails like '%current_username@email.com%'
        or pr.audit_user_emails like '%current_username@email.com%'
    -- ①预算（按产品线）（项目资源表+预算产品线表维度）
        or exists (select 1 from t_productline_budgeteer where product_id = pr.productline_code and budgeteer_name = 'current_username')))
    -- ③项目发起人、项目负责人、项目审批人（对象权限）（项目审批流维度）
    or p.id in (select object_id from t_approval_process ap where object_class = 'xxx.xxx'
        and exists (select 1 from t_approval_record ar where ar.workflow_process_id = ap.id and ar.deal_username = 'current_username'))
    -- ①预算（按 cc）（预算成本中心表维度）
    or exists (select 1 from t_costcenter_budgeteer where costcenter_id = p.costcenter_id and budgeteer_name = 'current_username'));
```

SQL 执行时间并未有改善，依次替换 exists 为 in，时间只有几百毫秒的差异，

为了保证行数为主表记录，所以没办法做过多的联表，由于④、①、③的筛选维度比较深，而且子表数据量比较大

虽然利用了 in 的查询结果缓存特性，且 in 的字段是主键，但是 in 的效率还是很低，缓存结果集很大的时候扫表次数简直不要太多

如此看来，增加索引应该是没必要了，但是可以受 in 的启发，进行了优化的尝试

## 优化思路

1. <span style="color:red;">容易被捕捉的条件放前面 -> 预先缩小结果集</span>（where 筛选是从左往右执行）
2. <span style="color:red;">主表很大，避免做 where 下的关联子查询 -> 尽量用 <主表字段>-[判断]-<子表筛选的一次性结果集></span> （有效避免造成 N 次 n 范围的子筛选）
3. <span style="color:red;">or -> union -> 并用 union</span>（or、in 效率等同，可以 or 化的 in 可以适当转成 union）
4. <span style="color:red;">in -> join  -> 交用 join</span> （不是 left join，join 取的是交集，特别是有索引的 join 比 索引字段 in 效果要优秀很多）
5. <span style="color:red;">特殊结果字段返回放在分页排序外层 </span>  ->  查询分页排序往往是对结果行数敏感，往往由内部主 SQL 决定

## 优化后的 SQL

优化后的 <span style="color:red;">SQL 执行时间达到 （0.45 秒左右）</span>

```sql
-- 非权限类的查询用 1=1 代替来讲解
(select t.* from t_project t where 1 = 1
    -- ③项目发起人（项目表维度）
    and (t.responsible_id = 5336471
	   -- ①预算（按 cc）（预算成本中心表维度） 主表很大，一次无关联子查询得到一次性结果集，筛选要快很多
	   or costcenter_id in (select ai.costcenter_id from t_costcenter_budgeteer ai where budgeteer_name = 'current_username')))

-- 拆开 or 去重
union

(select t.* from t_project t
  -- 取交集，用 带索引字段 某些时候比 in exists 快百倍
  join
	 -- ③项目发起人、项目负责人、项目审批人  关联无关联子查询得到一次性结果集，这里由于 流程表 很大，会产生比较大的结果集，用 join 主键关联 比之 主键 in 会快些
	 ((select object_id as project_id from  t_approval_process ap where object_class = 'xxx.xxx'
          and exists (select 1 from t_approval_record ar where ar.workflow_process_id = ap.id and ar.deal_username = 'current_username'))
     -- 同类型无关联子查询得到一次性结果集合并，代替 or
     union
	 -- ④资源联系人、资源审批人、结算数据查询人  同理 项目资源表 很大，会产生比较大的结果集，用 join 主键关联 比之 主键 in 会快些
	 ((select pr.project_id as project_id from t_project_resource pr where
		 pr.contact_user_emails like '%' || 'current_username@email.com' || '%'
		 or pr.amount_user_emails like '%' || 'current_username@email.com' || '%'
		 or pr.audit_user_emails like '%' || 'current_username@email.com' || '%'
         or exists (select 1 from t_productline_budgeteer where product_id = pr.productline_code and budgeteer_name = 'current_username')))) temp
  -- 主键映射对齐，取交集
  on temp.project_id = t.id
where 1 = 1)
```

- 第一个个很重要的观念，叫<span style="color:red;">一次性结果集提取</span>（比如上面的结果集定义成 temp 表），这个非常重要，因为能够有效的减少连表次数，进而减少到 1/n 次的查询，特别是这个每次查询总是全表扫描的时候。
- 第二个很重要的技巧，取交集的时候 join 效率往往比 in 要高，特别是有索引的键作为 join 关联关系的时候。

排序分页的话，在外面再套一层，加上 order by 和 rownum 的范围限定即可，这里就不展开了。