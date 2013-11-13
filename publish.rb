puts "building jekyll...\n"
puts `jekyll build`
puts "recreating master branch...\n"
puts `git branch -D master`
puts `git checkout -b master`
puts "setting up files for .nojekyll github pages deploy...\n"
puts `touch .nojekyll`
puts `cp -r _site/* ./`
puts "committing...\n"
puts `git add -A && git commit -m 'publishing #{Time.now}'`
puts "\nforce pushing master! crazy!...\n"
puts `git push origin master --force`
puts `git checkout source`
