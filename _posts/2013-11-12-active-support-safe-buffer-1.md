---
layout: post
title:  "Understanding ActiveSupport::SafeBuffer, Part One: A Puzzle"
date:   2013-11-12 17:25:00
---

Recently, one of my coworkers (an ex-academic-turned-developer like myself)
raised the following ruby puzzle in our group chat.

{% highlight ruby %}
2.0.0p247 :001 > string_one = 'a'.html_safe + 'a'
 => "aa"
2.0.0p247 :002 > string_two = 'a' + 'a'.html_safe
 => "aa"
2.0.0p247 :003 > string_one.html_safe?
 => true
2.0.0p247 :004 > string_two.html_safe?
 => false
{% endhighlight %}

To an experienced ruby/rails developer, there might not even be a *prima facie*
mystery here. If you're one of those, this series of posts probably isn't for you. To anyone else, at first glance this can easily appear odd.

<!--break-->

We're calling `String#html_safe` and we expect that to return a `String` object
that responds to `html_safe?` with `true`. And it does!

{% highlight ruby %}
2.0.0p247 :005 > 'a'.html_safe.is_a? String
 => true
2.0.0p247 :006 > 'a'.html_safe.html_safe?
 => true
{% endhighlight %}

So there's obviously going to be some logic that decides whether the result of
concatenating two strings is `html_safe?` when one of the concatenated strings
is and the other isn't. But what possible difference could the *order* of
concatenation make for the safety of the resulting string?

By the way, if you're not clear on the semantics of `#html_safe`, it's intended
to indicate that we know this particular string does not contain any html tags
that need to be escaped before rendering. If the users of your dating site
application can store arbitrary text explaining why you should ask them out,
for example, they could easily write

> I'm a really nice guy &lt;script src="//horrible.malware.com/ohno.js"&gt;

and if that text wasn't properly *escaped* (i.e., the `<` is replaced by `&lt;`)
before being rendered by some poor user's browser, it would actually load the
javascript from that url and execute it. Definitely not safe. So Rails escapes
angle brackets by default in rendered output, unless you flag the output as safe.

Also, just to be clear, if you don't send `#html_safe` to a new `String`, the
result is *never* safe &mdash; the method doesn't try to *decide* whether the string is safe, so even a perfectly innocuous string is considered unsafe
unless it's been explicitly flagged:

{% highlight ruby %}
2.0.0p247 :007 > 'mostly harmless text'.html_safe?
 => false
{% endhighlight %}

So that's the setup. Why in the world would we get different return values for
`#html_safe?` on the concatenated strings `string_one` and `string_two` in the
first code snippet above? The two strings are the *same*, right!?

{% highlight ruby %}
2.0.0p247 :008 > string_one == string_two
 => true
{% endhighlight %}

In [Part Two][part-two], I *still* won't explain the
answer &mdash; for that you'll have to wait for [Part Three][part-three].
That's because (as should be obvious by now) these posts are aimed at a
relative novice, like I was not long ago. And so I'm going to spend some time
talking about how you'd go about finding the explanation for this puzzle on
your own, if you didn't have someone to explain it to you.

[part-two]: http://gregat.es/blog/active-support-safe-buffer-2/
[part-three]: http://gregat.es/blog/active-support-safe-buffer-3/
