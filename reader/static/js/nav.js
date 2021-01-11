// (function (tags) {
//     var i = 0, len = tags.length;

//     for (; i < len; ++i) {
//         document.createElement(tags[i]);
//     }
// }(['header', 'nav', 'article', 'footer']));
/*备用文章目录动态生成*/
var articleDirectoryBuild = function () {
    var articleChildren = function children(childNodes, reg) {
            var result = [],
                isReg = typeof reg === 'object',
                isStr = typeof reg === 'string',
                node, i, len;
            for (i = 0, len = childNodes.length; i < len; i++) {
                node = childNodes[i];
                if ((node.nodeType === 1 || node.nodeType === 9) &&
                    (!reg ||
                        isReg && reg.test(node.tagName.toLowerCase()) ||
                        isStr && node.tagName.toLowerCase() === reg)) {
                    result.push(node);
                }
            }
            return result;
        };
    var createPostDirectory = function (article, directory, isDirNum) {
            var contentArr = [],
                titleId = [],
                levelArr, root, level,
                currentList, list, li, link, i, len;
            levelArr = (function (article, contentArr, titleId) {
                var titleElem = articleChildren(article.childNodes, /^h\d$/),
                    levelArr = [],
                    lastNum = 1,
                    lastRevNum = 1,
                    count = 0,
                    guid = 1,
                    id = 'directory' + (Math.random() + '').replace(/\D/, ''),
                    lastRevNum, num, elem;
                while (titleElem.length) {
                    elem = titleElem.shift();
                    contentArr.push(elem.innerHTML);
                    num = +elem.tagName.match(/\d/)[0];
                    if (num > lastNum) {
                        levelArr.push(1);
                        lastRevNum += 1;
                    } else if (num === lastRevNum ||
                        num > lastRevNum && num <= lastNum) {
                        levelArr.push(0);
                        lastRevNum = lastRevNum;
                    } else if (num < lastRevNum) {
                        levelArr.push(num - lastRevNum);
                        lastRevNum = num;
                    }
                    count += levelArr[levelArr.length - 1];
                    lastNum = num;
                    elem.id = elem.id || (id + guid++);
                    titleId.push(elem.id);
                }
                if (count !== 0 && levelArr[0] === 1) levelArr[0] = 0;
                return levelArr;
            })(article, contentArr, titleId);
            currentList = root = document.createElement('ul');
            // li = document.createElement('li');
            // link = document.createElement('a');
            // link.href = '../index.html';
            // link.innerHTML = '<< 返回';
            // li.appendChild(link);
            // currentList.appendChild(li);
            dirNum = [0];
            for (i = 0, len = levelArr.length; i < len; i++) {
                level = levelArr[i];
                if (level === 1) {
                    list = document.createElement('ul');
                    if (!currentList.lastElementChild) {
                        currentList.appendChild(document.createElement('li'));
                    }
                    currentList.lastElementChild.appendChild(list);
                    currentList = list;
                    dirNum.push(0);
                } else if (level < 0) {
                    level *= 2;
                    while (level++) {
                        if (level % 2) dirNum.pop();
                        currentList = currentList.parentNode;
                    }
                }
                dirNum[dirNum.length - 1]++;
                li = document.createElement('li');
                link = document.createElement('a');
                link.href = '#' + titleId[i];
                link.innerHTML = !isDirNum ? contentArr[i] :
                    dirNum.join('.') + '.' + contentArr[i];
                li.appendChild(link);
                currentList.appendChild(li);
            }
            directory.appendChild(root);
        };
    var adjustArticleContent = function (article, directory, maxHeight) {
        var height = article.offsetHeight;
        var dirHeight = directory.offsetHeight;
        if (height > dirHeight) {
            if (height > maxHeight && dirHeight + 36 < maxHeight) {
                article.style.height = maxHeight + 'px';
                article.style["overflow-y"] = 'scroll';
            } else if (height > maxHeight && dirHeight + 36 > maxHeight) {
                article.style.height = dirHeight + 36 + 'px';
                article.style["overflow-y"] = 'scroll';
            }
        }
    }
    createPostDirectory(document.getElementById('article-content'), document.getElementById('js-nav-directory'), true);
    adjustArticleContent(document.getElementById('article-container'), document.getElementById('js-nav-directory'), 1000);
};
/*初始化加载js-dir*/
var dirEle = document.getElementById('java-nav-directory');
if (null != dirEle && dirEle.innerHTML == "") {
    articleDirectoryBuild();
    var dirEle = document.getElementById('js-nav-directory');
}
/*移动端目录事件定义*/
/* 
var mediaMenubar = document.getElementById("mediaMenubar");
if(null != mediaMenubar) {
    var dirLinkEvent = false;
    mediaMenubar.onclick = function() {
        var style = window.getComputedStyle(dirEle);
        if (style.display == "none") {
            this.className = "button_active";
            dirEle.style.display = "block";
            document.getElementsByTagName("nav")[0].style.height = "auto";
        } else {
            this.className = "button";
            dirEle.style.display = "none";
            document.getElementsByTagName("nav")[0].style.height = "48px";
        }
        dirLinkEvent = true;
    };
} 
*/

var aLink = dirEle.getElementsByTagName("a");
for (i = 0;i < aLink.length;i++) {
    aLink[i].onclick = function() {
        if (dirLinkEvent) {
            dirEle.style.display = "none";
            document.getElementsByTagName("nav")[0].style.height = "48px";
        }
    };
}
var lis = dirEle.getElementsByTagName("li");
for(i = 0;i < lis.length;i++) {
    lis[i].onclick = function() {
        this.style.background = "#DADEFA";
        this.getElementsByTagName('a')[0].click();
    };
    lis[i].onmouseover = function() {
        var width = this.offsetWidth;
        var aWidth = this.getElementsByTagName("a")[0].offsetWidth;
        if (width < aWidth) {
            this.style.width = "auto";
        }
    }
}



