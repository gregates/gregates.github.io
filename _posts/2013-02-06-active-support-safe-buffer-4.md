---
layout: post
title:  "Understanding ActiveSupport::SafeBuffer (part four)"
subtitle: "Metaphysics!"
date:   2013-11-24 14:10:00
---

In [Part One][part-one] of this series, I introduced a puzzle that can be
seen in the following code snippet:

{% highlight ruby %}
2.0.0-p353 :001 > string_one = 'a' + 'a'.html_safe
 => "aa"
2.0.0-p353 :002 > string_two = 'a'.html_safe + 'a'
 => "aa"
2.0.0-p353 :003 > string_one == string_two
 => true
2.0.0-p353 :004 > string_one.html_safe?
 => false
2.0.0-p353 :005 > string_two.html_safe?
 => true
{% endhighlight %}

After learning *why* `string_two` is html safe and `string_one` is not in
[Part Three][part-three], this might not seem puzzling anymore. In this post,
I want to offer an explanation of why these ruby expressions were jointly
puzzling in the first place. The answer will take us away from code and into
the realm of philosophical logic.

<!--break-->

[part-one]: /blog/active-support-safe-buffer-1/
[part-two]: /blog/active-support-safe-buffer-2/
[part-three]: /blog/active-support-safe-buffer-3/
