# 检查 Jekyll 是否安装
if command -v jekyll >/dev/null 2>&1; then
  echo "Jekyll 已安装，版本：$(jekyll -v)"
else
  echo "Jekyll 未安装，开始安装！"
  echo 'gem install jekyll -v 3.5.2 -V'
  gem install jekyll -v 3.5.2 -V
fi

# 检查 Bundler 是否安装
if command -v bundle >/dev/null 2>&1; then
  echo "Bundler 已安装，版本：$(bundle -v)"
else
  echo "Bundler 未安装，开始安装！"
  echo 'gem install bundler -V'
  gem install bundler -V
fi

rm -rf vendor/bundle
echo 'bundle install --path vendor/bundle -V'
bundle install --path vendor/bundle -V