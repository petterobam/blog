config_files=$(find . -maxdepth 1 -name '_config*.yml' | tr '\n' ',' | sed 's/,$//')

bundle exec jekyll serve --config $config_files --incremental -V