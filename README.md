# blog
我的GitHub博客，链接：http://www.petterobam.cn

# 使用主题
https://github.com/yizeng/jekyll-theme-simple-texture

# 本地部署和调试

```
gem install jekyll bundler
bundle install --path vendor/bundle
bundle exec jekyll serve
rm -r _site | bundle exec jekyll serve --incremental
rm -r _site && bundle exec jekyll serve --incremental
rm -r _site | bundle exec jekyll serve --config _config.dev.yml
rm -r _site && bundle exec jekyll serve --config _config.dev.yml
```

# 图片地址

Github
- https://raw.githubusercontent.com/petterobam/picture-bucket/main/{path}

CDN 映射地址
- https://cdn.jsdelivr.net/gh/petterobam/picture-bucket@main/{path}

