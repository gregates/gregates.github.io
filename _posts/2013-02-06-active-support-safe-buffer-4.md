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
[Part Three][part-three], this series of expressions might no longer seem
puzzling. In this post,
I want to offer an explanation of why these ruby expressions were jointly
puzzling in the first place. The answer will take us away from code and into
the realm of philosophical logic.

<!--break-->

<aside>It's important to distinguish Leibniz's Law, which is about as
uncontroversial as it's possible for a proposition to be in philosophy, from
Leibniz's more famous principle known as the "Identity of Indiscernibles" (II),
which is the converse of Leibniz's Law. That is, (II) says that if two objects
have all their properties in common, then they are identical. Although this may
sound just as trivial as Leibniz's Law, it's actually much more controversial.
Confusingly, (II) is itself sometimes referred to as Leibniz's Law, as in the
[Stanford Encyclopedia of Philosophy article][ii] on (II), and
sometimes people use "Leibniz's Law" to mean the conjunction of both
principles. (What I'm calling Leibniz's Law can also be called the
"Indiscernibility of Identicals.")</aside>

I propose that the explanation for why the set of expressions above seems
puzzling is that the last two statements &mdash; that `string_one` is *not*
safe but `string_two` is &mdash; seem to jointly entail that `string_one`
and `string_two` are not identical. The fact that it's natural to make this
inference is part of the intuitive support for the idea that ["Leibniz's Law" is
central to our concept of identity][identity]. Leibniz's Law is the name often
given to the following logical principle:

<div class="prop">x = y → (∀F)(Fx ↔ Fy)</div>

In words, this principle says that if two things are identical, then they share
all the same properties. So if `string_one` is unsafe and `string_two` is safe,
then `string_one` and `string_two` are not identical.

This can seem puzzling because a natural interpretation of `==` in ruby is
that it expresses identity: one expects `a == b` to be true if and only if a
and b are the *same* object. But there's identity and there's identity &mdash;
Leibniz's Law is a proposition about *ontology*, about what there is in the
broadest possible sense, and does not hold of looser ways of talking about
identity. I may be the *same* person that I was when I was
fifteen years old, and yet I may without contradicting myself say "I'm not at
all the same person I was when I was in high school." This is because the
relation we express by saying that two things are the "same" may be a very
different relation than ontological identity, as becomes very clear with even
a cursory investigation into the thorny philosophical problem of
[personal identity][personal-identity]. For the rest of this post, I
will reserve the word "identity" to mean a relationship that obeys Leibniz's Law.

So what we actually learned in [Part Three][part-three] of this series could
be put this way: the `==` method for the `String` class in ruby does not
express *identity*, but some other relation of sameness. And really this should
not be surprising, because, like `+`, `==` is a method in ruby, not an operator.
So its semantics may well vary from class to class. If we wanted, we could mess
with people by overriding `String#==` to always return true, so that any string
is always the "same" as any other object it's compared to!

I'm not particularly good at reading C code, and I won't expect you to be, so we
will ignore the precise implementation details of `String#==`. But
the [documentation](http://www.ruby-doc.org/core-2.1.0/String.html#method-i-3D-3D) tells us what it's intended to mean.

> returns similarly to #eql?, comparing length and content.

(There are some other details about comparing strings to non-strings, but we
can ignore those for our purposes.)

The key is that this documentation tells us which properties matter for string
equality &mdash; length and content (and membership in the `String` class).
Other properties, such as html-safety,
don't matter as far as string equality is concerned. So two strings are said to
be the same string if they have the same content and the same length.
Content and length, in the jargon of metaphysics, would be the 
[essential properties][essential] of strings. What this means exactly is
difficult to define precisely, but the idea
goes all the way back to [Aristotle][aristotle], who would have said that
two objects are the same "*qua* string" if they are the same with respect to
length and content and both belong to the `String` class. But two objects which
are the same *qua* string may be different *qua* some other type, e.g.,
different *qua* `ActiveSupport::SafeBuffer`. (`ActiveSupport::SafeBuffer` does
not define it's own method for testing equality *qua*
`ActiveSupport::SafeBuffer`, however. After all, all it takes to be the
same *qua* `ActiveSupport::SafeBuffer` is to be the same *qua* string and to
also be the same with respect to html safety, which is easy enough to test for.)

With this philosophical terminology under our belt, we can easily express what
was puzzling about our puzzle in [Part One][part-one]: it's natural to
intepret `==` as expressing an identity relation, but it does
not obey Leibniz's Law, as our puzzle shows. And we can easily express the
resolution to the puzzle: `==` is not an identity relation in ruby, 
but rather expresses
a class-relative notion of sameness *qua* class, and sameness *qua* string is
a matter of sameness of content and length alone.

In fact this is quite natural, and I think the semantics the designers of ruby
chose for `String#==` is exactly what it should be. And for the most part you'd
just use `==` without thinking about it, and it would mean what you'd expect it
to mean. The cool part is that programming languages can give rise to
philosophical puzzles just as natural languages can.

[part-one]: /blog/active-support-safe-buffer-1/
[part-two]: /blog/active-support-safe-buffer-2/
[part-three]: /blog/active-support-safe-buffer-3/
[identity]: http://plato.stanford.edu/entries/identity/
[ii]: http://plato.stanford.edu/entries/identity-indiscernible/
[personal-identity]: http://plato.stanford.edu/entries/identity-personal/
[essential]: http://plato.stanford.edu/entries/essential-accidental/
[aristotle]: http://plato.stanford.edu/entries/aristotle-metaphysics/
