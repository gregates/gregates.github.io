---
layout: post
title:  "Understanding ActiveSupport::SafeBuffer (part two)"
subtitle: "Finding the Right Docs"
date:   2013-11-19 23:42:00
---

In [Part One][part-one], I presented a puzzle about the Rails method
`#html_safe`. It's possible to concatenate two identical strings, after sending
`#html_safe` to one of them, where the result's
`#html_safe?` property depends on the *order* of concatenation, even though the results
*appear* to be identical strings (i.e., `string_one == string_two` returns `true`).
In [Part Three][part-three], we'll reason through the explanation for this surprising fact. This post is about finding the solution to this puzzle without the benefit of [Part Three][part-three]. For a novice
programmer like myself-a-year-ago, developing this skill is much more valuable
than knowing the answer to any single question about ruby or rails. Teach a
person to fish, and all that.

<!--break-->

If you want to know what a ruby `String` method does, the obvious first place
to look is the api documentation for the ruby `String` class. For ruby's core
classes and classes defined in the standard library, you can find api
documentation at
<a href="http://ruby-doc.org/" target="_blank">ruby-doc.org</a>.
You can go there and type
the class name into the search bar, or really I usually just google "ruby #{class\_name}", e.g., "ruby string". If you do that, you'll see that you get results
for different versions of the language &mdash; it's always helpful to know which
version of ruby you're using. The top result is *usually* the documentation
for the latest version.

<aside>If you aren't familiar with the convention for these docs, `#` before a method name indicates an *instance* method for the class, whereas `::` before a method name indicates a *class* method.</aside>

If you click through to the <a href="http://ruby-doc.org/core/String.html" target="_blank">api docs for `String`</a>,
you will see, if you scan the method list in the sidebar, that there is no
`#html_safe` method defined for the core `String` class. These aren't the docs we're looking for.

Not knowing exactly where to look for documentation on a method is not unusual if
you're working with ruby &mdash; ruby allows re-opening classes and adding
to them, so gems like rails can define new methods on core classes that are only available when that gem is loaded. Rails in particular does this liberally with ruby core classes. So the next place
to look is the api documentation for rails, at <a href="http://api.rubyonrails.org" target="_blank">api.rubyonrails.org</a>.
If you type "html_safe" in the
search bar there, you'll get four results &mdash; rails is indeed the library
that defines this method. Interestingly, there are *three* 
results for `#html_safe?`, which we'll get to in [Part Three][part-three].
But right now we want the documentation for `#html_safe`, so if we click on that....

Uh oh, <a href="http://api.rubyonrails.org/classes/String.html#method-i-html_safe" target="_blank">there's no documentation</a>!

Don't panic. They say that good ruby code is self-documenting. And every method
documented here has links to view the source code for that method or even
visit github for the source for the entire file. If you click on the "show" link, you'll see

{% highlight ruby %}
def html_safe
  ActiveSupport​::SafeBuffer.new(self)
end
{% endhighlight %}

Phew! That's actually pretty easy to understand &mdash; all the method does is
initialize and return an `ActiveSupport::SafeBuffer` object, passing in the recipient of
`#html_safe`. But what the heck is an `ActiveSupport::SafeBuffer`? We can find
out by typing that in the search bar....

<a href="http://api.rubyonrails.org/classes/ActiveSupport/SafeBuffer.html" target="_blank">The docs for `ActiveSupport::SafeBuffer`</a> tell us what we need to
know. Right at the top of the page we see that it's a subclass
of `String`. So now we know what happens when we call `#html_safe` on a string. We create a
new instance of a subclass of `String` &mdash; which is why the result still
`is_a?(String)` &mdash; and return that.

That's not actually the full answer to our puzzle. But now we know the key fact
that, if we understand class inheritance in ruby and are comfortable with using the
rails api docs and reading some source code, will let us reason through the rest of the answer in
[Part Three][part-three].

#### Advanced Tip

It can sometimes be frustrating not knowing where to look for the definition
of a method you're using. But ruby methods actually know where they're defined,
so you can just ask them!

{% highlight ruby %}
2.0.0p247 :001 > String.instance_method(:html_safe).source_location
 => ["/Users/greg/.rvm/gems/ruby-2.0.0-p247@default/gems/activesupport-4.0.
0/lib/active_support/core_ext/string/output_safety.rb", 191]
{% endhighlight %}

Ruby core methods will return `nil`.

[part-one]: /blog/active-support-safe-buffer-1/
[part-three]: /blog/active-support-safe-buffer-3/
[part-four]: /blog/active-supprot-safe-buffer-4/
