---
layout: post
title:  "Understanding ActiveSupport::SafeBuffer (part three)"
subtitle: "Inheritance and Method Lookup (i.e., the Answer)"
date:   2013-11-24 14:10:00
---

In [Part Two][part-two], we discovered that the `String#html_safe` method
does return a `String` object, but a special kind of string &mdash; an
`ActiveSupport::SafeBuffer`.

{% highlight ruby %}
2.0.0p247 :001 > 'a'.html_safe.is_a? String
 => true
2.0.0p247 :002 > 'a'.html_safe.class
 => ActiveSupport​::SafeBuffer
{% endhighlight %}

That's not yet an answer to our puzzle from [Part One][part-one], but it is the
key piece of information we need to reason our way through the puzzle, if we
understand class inheritance and method lookup in ruby.

<!--break-->

Recall the setup of the puzzle from [Part One][part-one].

{% highlight ruby %}
2.0.0p247 :003 > string_one = 'a'.html_safe + 'a'
 => "aa"
2.0.0p247 :004 > string_two = 'a' + 'a'.html_safe
 => "aa"
2.0.0p247 :005 > string_one.html_safe?
 => true
2.0.0p247 :006 > string_two.html_safe?
 => false
{% endhighlight %}

How many different methods are called in these four lines? It may look like the
answer is "three" &mdash; `String#html_safe`, `String#+`, and `String#html_safe?`. But in fact there are five:

* `String#html_safe`
* `ActiveSupport::SafeBuffer#+`
* `String#+`
* `ActiveSupport::SafeBuffer#html_safe?`
* `Object#html_safe?`

Some of these methods have the same name, but they're defined for different
classes. Now, I'm not going to try to cover all the subtleties of ruby method
dispatch in this post, but the important thing to know is that when you send a
message `:foo` to an instance of a class, the function that gets executed is the
instance method `#foo` defined on the *first* class or module in the object's
class's ancestry chain, which you can inspect with the `Module#ancestors`
method (the following output is from a brand new default Rails 4.0.0 app on
ruby 2.0.0-p247).

<div class="highlight"><pre><code class="ruby"><span class="mi">2</span><span class="o">.</span><span class="mi">0</span><span class="o">.</span><span class="mi">0</span><span class="o">-</span><span class="n">p247</span> <span class="p">:</span><span class="mo">007</span> <span class="o">&gt;</span> <span class="no">ActiveSupport</span><span class="o">::</span><span class="no">SafeBuffer</span><span class="o">.</span><span class="n">ancestors</span>
 <span class="o">=&gt;</span> <span class="o">[</span><span class="no">ActiveSupport</span><span class="o">::</span><span class="no">SafeBuffer</span><span class="p">,</span> <span class="nb">String</span><span class="p">,</span> <span class="no">JSON</span><span class="o">::</span><span class="no">Ext</span><span class="o">::</span><span class="no">Generator</span><span class="o">::</span><span class="no">GeneratorMethods</span><span class="o">::</span>
<span class="nb">String</span><span class="p">,</span> <span class="no">Comparable</span><span class="p">,</span> <span class="no">Object</span><span class="p">,</span> <span class="no">PP</span><span class="o">::</span><span class="no">ObjectMixin</span><span class="p">,</span> <span class="no">ActiveSupport</span><span class="o">::</span><span class="no">Dependencies</span><span class="o">::</span><span class="no">Loadab
le</span><span class="p">,</span><span class="no">JSON</span><span class="o">::</span><span class="no">Ext</span><span class="o">::</span><span class="no">Generator</span><span class="o">::</span><span class="no">GeneratorMethods</span><span class="o">::</span><span class="no">Object</span><span class="p">,</span> <span class="no">Kernel</span><span class="p">,</span> <span class="no">BasicObject</span><span class="o">]</span>
</code></pre></div>

As an example, notice that `#ancestors` is undefined for an *instance* of
`ActiveSupport::SafeBuffer`

<div class="highlight"><pre><code class="ruby"><span class="mi">2</span><span class="o">.</span><span class="mi">0</span><span class="o">.</span><span class="mi">0</span><span class="o">-</span><span class="n">p247</span> <span class="p">:</span><span class="mo">00</span><span class="mi">8</span> <span class="o">&gt;</span> <span class="s1">'a'</span><span class="o">.</span><span class="n">html_safe</span><span class="o">.</span><span class="n">ancestors</span>
NoMethodError: undefined method `ancestors' for "a":ActiveSupport::SafeBuffer
</code></pre></div>

This is because, while a class is an instance of the the `Class` class, which inherits from the `Module` class, an instance of a class is not itself a `Class`
and so does not have `Module` in its ancestry chain.

<div class="highlight"><pre><code class="ruby"><span class="mi">2</span><span class="o">.</span><span class="mi">0</span><span class="o">.</span><span class="mi">0</span><span class="o">-</span><span class="n">p247</span> <span class="p">:</span><span class="mo">00</span><span class="mi">9</span> <span class="o">&gt;</span> <span class="no">ActiveSupport</span><span class="o">::</span><span class="no">SafeBuffer</span><span class="o">.</span><span class="n">class</span>
 <span class="o">=&gt;</span> <span class="no">Class</span>
<span class="mi">2</span><span class="o">.</span><span class="mi">0</span><span class="o">.</span><span class="mi">0</span><span class="o">-</span><span class="n">p247</span> <span class="p">:</span><span class="mo">010</span> <span class="o">&gt;</span> <span class="no">ActiveSupport</span><span class="o">::</span><span class="no">SafeBuffer</span><span class="o">.</span><span class="n">class</span><span class="o">.</span><span class="n">ancestors</span>
 <span class="o">=&gt;</span> <span class="o">[</span><span class="no">Class</span><span class="p">,</span> <span class="no">Module</span><span class="p">,</span> <span class="no">ActiveSupport</span><span class="o">::</span><span class="no">Dependencies</span><span class="o">::</span><span class="no">ModuleConstMissing</span><span class="p">,</span> <span class="no">Object</span><span class="p">,</span> <span class="no">PP</span><span class="o">:
:</span><span class="no">ObjectMixin</span><span class="p">,</span> <span class="no">ActiveSupport</span><span class="o">::</span><span class="no">Dependencies</span><span class="o">::</span><span class="no">Loadable</span><span class="p">,</span> <span class="no">JSON</span><span class="o">::</span><span class="no">Ext</span><span class="o">::</span><span class="no">Generator</span><span class="o">::</span><span class="no">Gener
atorMethods</span><span class="o">::</span><span class="no">Object</span><span class="p">,</span> <span class="no">Kernel</span><span class="p">,</span> <span class="no">BasicObject</span><span class="o">]</span>
</code></pre></div>

So when you send `:ancestors` to an instance of `ActiveSupport::SafeBuffer`, it
checks every class or module in the ancestry chain for `ActiveSupport::SafeBuffer`,
in order, for an instance method `#ancestors`. When it finds none, it raises
a `NoMethodError`. But since `Module` is the first ancestor of `Class`, when
you send `:ancestors` to an instance of `Class`, it's `Module#ancestors` that
gets called (you can check the docs to see that `Class` does not define its own
`#ancestors` method).

Remember in [Part Two][part-two] when we noticed that the [api docs for rails](http://api.rubyonrails.org/)
had entries for three different methods named `#html_safe?`? Here's where it
becomes relevant. If you search for "html_safe" again, you'll see that it
actually tells you, in the search results, the name of the class or module that
defines the method. In this case, different versions of `#html_safe?` are
defined for `ActiveSupport::SafeBuffer`, `Numeric`, and `Object`. We can
ignore the `Numeric#html_safe?` method, because `Numeric` doesn't appear in
the relevant ancestry chains for our strings. But let's look at the other two.

The source for `Object#html_safe?` is simple &mdash; objects are assumed to be
*un*safe by default.

{% highlight ruby %}
def html_safe?
  false
end
{% endhighlight %}

For an `ActiveSupport::SafeBuffer`, on the other hand, `#html_safe?` simply
checks for the presence of an instance variable flag.

{% highlight ruby %}
def html_safe?
  defined?(@html_safe) && @html_safe
end
{% endhighlight %}

You might think, then, that calling `String#html_safe` would set this flag, but
we saw that all it does is initialize and return an `ActiveSupport::SafeBuffer`
object that wraps the receiving string. But initialization can have effects; to
see what is really going on we need to see what happens in
`ActiveSupport::SafeBuffer::new`, the source for which we can see on the same
api doc page as `#html_safe?`

{% highlight ruby %}
def initialize(*)
  @html_safe = true
  super
end
{% endhighlight %}

So `String#html_safe` *does* set this flag, as we suspected.

Now there's one more key to the puzzle. As I noted above, not only do different
methods named `#html_safe?` get called in our puzzle, but so do different
versions of `#+`. The plus sign in ruby is not an operator, it's a method, and
you can define its behavior on your objects however you want. So when we
append a `String` to an existing `ActiveSupport::SafeBuffer`, we're using
a *different* method than when we append an `ActiveSupport::SafeBuffer` to a
`String` &mdash; both classes define a `#+` method, as you can see from the
relevant api docs.

This can be confusing; I find that for thinking about method dispatch its
helpful to use a different way of sending the `:+` message with its argument to
the recipient. The following is equivalent to the first two lines of our
puzzle.

{% highlight ruby %}
2.0.0-p247 :011 > string_one = 'a'.html_safe.send(:+, 'a')
 => "aa"
2.0.0-p247 :012 > string_two = 'a'.send(:+, 'a'.html_safe)
 => "aa"
{% endhighlight %}

In the first case, because the message recipient is an `ActiveSupport::SafeBuffer`, the method
dispatcher finds the `ActiveSupport::SafeBuffer#+` method and calls it with
the string `'a'` as the argument. In the second case, the method dispatcher
finds the `String#+` method, because the message recipient is a plain-old
`String` literal.

So the last piece of our puzzle is the source for `ActiveSupport::SafeBuffer#concat`, because if you look at the source for `ActiveSupport::SafeBuffer#+` you'll
see that it just returns a duplicate of `self` to which it sends `:concat` with
its argument.

{% highlight ruby %}
def concat(value)
  if !html_safe? || value.html_safe?
    super(value)
  else
    super(ERB​::Util.h(value))
  end
end
{% endhighlight %}

So what is happening here? There are two code paths to follow.

If `self` is somehow
*not* safe (despite being an `ActiveSupport::SafeBuffer`), or if we know that
the value we're appending is safe, then we use `super` to tell the method
dispatcher it should call the next method up the chain, which in
this case will be `String#concat`. So that'll just append the value without
doing anything to the `@html_safe` instance variable flag and the object that's returned will still be the dup of the original message recipient.
So the return value will still be an `ActiveSupport::SafeBuffer` and it will
keep its state with respect to safety (since we know adding a safe
value can't make the result unsafe).

But if `self` is safe *and* the value we're appending is *not* safe, then we
escape the appended value *prior* to appending it via `String#concat`. That's
what `ERB::Util::h` does &mdash; this is the same `h` helper method that was
used all over the place to escape unsafe string output in rails views in early
versions, before they more sensibly made it the default behavior. But once a
string has been escaped, then we know that it's safe, and indeed the return
value of this helper method will be an `ActiveSupport::SafeBuffer` rather than
a string.

{% highlight ruby %}
2.0.0-p247 :013 > escaped_string = ERB​::Util.h('a')
 => "a"
2.0.0-p247 :014 > escaped_string.is_a?(ActiveSupport​::SafeBuffer)
 => true
2.0.0-p247 :015 > escaped_string.html_safe?
 => true
{% endhighlight %}

So no matter what, when we append a value to an `ActiveSupport::SafeBuffer`,
what we end up with is an `ActiveSupport::SafeBuffer` that preserves the
safety of the message recipient, though it may do so by first escaping whatever
you are trying to append.

But of course, if we do things in the other order, i.e., we append an
`ActiveSupport::SafeBuffer` to a plain old `String` object, we just end up using
the `String#concat` method, which doesn't care about safety or escaping html and
will just give you back another plain-old string object. But when we send `:html_safe?` to a `String` object, the method dispatcher doesn't find a method with
that name until it's made it up the ancestry chain all the way to `Object#html_safe?`, which, as we've seen, always returns false. So appending to a `String`
will always return an unsafe result.

As an aside, this can result in surprisingly different behavior for the two
different `#+` methods for certain types of arguments in other ways, as well.

<div class="highlight"><pre><code class="ruby"><span class="mi">2</span><span class="o">.</span><span class="mi">0</span><span class="o">.</span><span class="mi">0</span><span class="o">-</span><span class="n">p247</span> <span class="p">:</span><span class="mo">01</span><span class="mi">9</span> <span class="o">&gt;</span> <span class="s1">'a'</span><span class="o">.</span><span class="n">html_safe</span> <span class="o">+</span> <span class="mi">1</span>
 <span class="o">=&gt;</span> <span class="s2">"a\u0001"</span>
<span class="mi">2</span><span class="o">.</span><span class="mi">0</span><span class="o">.</span><span class="mi">0</span><span class="o">-</span><span class="n">p247</span> <span class="p">:</span><span class="mo">020</span> <span class="o">&gt;</span> <span class="s1">'a'</span> <span class="o">+</span> <span class="mi">1</span>
TypeError: no implicit conversion of Fixnum into String
</code></pre></div>

But the more interesting difference &mdash; the intended difference &mdash; can
be seen when we combine strings that actually include unsafe characters.

{% highlight ruby %}
2.0.0-p247 :016 > '<script>' + '<script>'.html_safe
 => "<script><script>"
2.0.0-p247 :017 > '<script>'.html_safe + '<script>'
 => "<script>&lt;script&gt;"
{% endhighlight %}

So that's it. Now we know why the unexpected behavior from the puzzle in
[Part One][part-one] occurs. [Part Four][part-four] won't really be about code.
Instead, I'd like to explore what we've learned about the *semantics* of ruby,
or at least of "+" and "==" as applied to strings, from
the perspective of philosophical logic.

[part-one]: /blog/active-support-safe-buffer-1/
[part-two]: /blog/active-support-safe-buffer-2/
[part-four]: /blog/active-supprot-safe-buffer-4/
