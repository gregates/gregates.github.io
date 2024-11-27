+++
title = "Float like Excel"
date = 2024-11-27
+++

Microsoft Excel stores numbers in a binary floating-point format. Specifically, [the
documentation](https://learn.microsoft.com/en-us/office/troubleshoot/excel/floating-point-arithmetic-inaccurate-result)
tells us that Excel "was designed around" [IEEE 754](https://en.wikipedia.org/wiki/IEEE_754) and
uses a version of the binary64 type specified in that document. In the course of building [the
world's fastest spreadsheet](https://rowzero.io/home), I've had occasion to look into some of the
nuances of how Excel handles numbers. In this post, I will explain one way in which Excel's behavior
surprised me. Excel discards more numeric precision than is strictly necessary for the binary64
format (more commonly known as double-precision floating point numbers, or "doubles" for short).

(If you're already an expert on the binary64 format, feel free to skip the next two sections.)

## Quick primer on binary64

The binary64 format encodes numbers in 64 bits. It uses 1 bit for the *sign*, like any signed number
format. 11 bits are used to encode the *exponent*, and 52 bits for the *significand*, sometimes also
called the *mantissa*.

As an 11-bit unsigned integer, the exponent can range from 0 to 2047. But we want to
support negative exponents, so the intended value is recovered by subtracting 1023, also known as
the *bias*.

The 52 bits of the significand are used as the fractional part of a number with a leading 1 (except
in the subnormal case, which we'll ignore &mdash; Excel explicitly doesn't support it, anyway). We
can get away with using 52 bits for a 53-bit number because the most significant digit of any number
is guaranteed to be non-zero, which in binary means it must be 1. So let's disambiguate: we'll call
the (unsigned) integer represented by the 52 bits the *fraction*, and the *significand* is always a
53 bit number, and is recovered by adding the leading 1, i.e., the significand is 1.*fraction*. Note that this is a binary
fraction, so multiplying by 2<sup>*n*</sup> just shifts the decimal point *n* places to the right, like
multiplying by 10<sup>*n*</sup> does in decimal.

Then we can recover the number encoded in the bits as:

> (-1)<sup>*sign*</sup> &times; *significand* &times; 2<sup>*exponent*-1023</sup>

Let's also define a *representable* number as one which can be recovered, using this formula, from
a binary64 number.

A few facts that follow from these definitions:

1. Not every number is representable. For example, 1234567890.123456789 &mdash; it's not possible to
   encode this many significant decimal digits in 53 binary digits.
2. The largest representable number is 1.7976931348623157e308 (where "e308" is scientific notation
   meaning "&times;10<sup>308</sup>").
3. The least representable number is -1.7976931348623157e308.
4. The smallest representable fraction (again ignoring subnormal numbers) is 2.2250738585072014e-308.
5. In general, decimal numbers with 15 significant digits or fewer which are neither too large nor
   too small *are* representable, but some numbers with as many as 17 significant decimal digits are representable.
6. An example of the last is 2<sup>53</sup>, which is equivalent to 9,007,199,254,740,992 (16
   significant digits). This number is just barely too big to fit in the 53 bits of the
   significand. But since it's exactly 2<sup>52</sup> &times; 2<sup>1</sup>, it can be represented that
   way.

So what happens when you have a number that isn't representable, and you need to store it in this
format?

## Rounding rules

Well, you have no choice but to round. But round to what? The nearest representable number is the
option that introduces the least rounding error &mdash; the smallest delta between the number you
want and the number you get. So that's what the IEEE 754 specification says to do. And then you also
need a rule for breaking ties, when there are two equidistant representable numbers. The typical,
but not necessarily required, rule is "round ties to even", which is more colloquially known as
"banker's rounding". In binary64, since there's only one even digit, that means if you're
equidistant to two representable numbers, you pick the one with a 0 in the least digit in the
significand.

Here's an example. As noted above, 2<sup>53</sup> is representable. We saw that this was because it
can be represented as a 53-bit number multiplied by 2. This is true for *every* even integer in the
range 2<sup>53</sup> to 2<sup>54</sup> - 1. But the odd integers are not representable.

So if we try to parse 2<sup>53</sup> + 1, we have to round it either to 2<sup>53</sup> or
2<sup>53</sup> + 2. The former is representable as 2<sup>52</sup> &times; 2; the latter is
representable as (2<sup>52</sup> + 1) &times; 2. For the former, the binary significand is a one
followed by 52 zeros. The latter has a one followed by 51 zeros and a trailing one. So the rule says
to choose the former. And this is what we see in, for example, rust's `f64` type. The following
program executes successfully:

```rust
fn main() {
    let a = 2f64.powi(53);
    let b = a + 1.0;
    let c = a + 2.0;

    assert_eq!(a, b);
    assert_ne!(a, c);
}
```

## What does Excel do?

So we're now in a position to state how Excel diverges from what I'd expect from an implementation
of IEEE 754 binary64 numbers. Excel does not round to the nearest representable number. Instead,
they truncate to 15 significant decimal digits, which as we noted above is guaranteed to be
representable. And they do this even if a number with more than 15 significant decimal digits is
representable without rounding!

For example if you type 9,007,199,254,740,992 (2<sup>53</sup>) into a cell in Excel, what you get
back is 9,007,199,254,740,990. Note the final digit. You get the same result if you enter any number
in the range 9,007,199,254,740,990 to 9,007,199,254,740,999.

This is true even though 9,007,199,254,741,000 is accepted as-is by Excel, and is closer to
9,007,199,254,740,999 than the value it actually rounds to. So this is not rounding &mdash; it's
truncation to 15 significant digits.

## Pros and cons of Excel's behavior

A consequence of what Excel does is that it introduces a larger overall rounding error. In rust, if
you subtract 2<sup>53</sup> from 2<sup>53</sup> + 2, you get 2, which is the precise, correct
result. In Excel, you get 0. If you introduce many such errors, and then do, say, a sum over a bunch
of numbers with individual small rounding errors, the total error can add up to be quite large.
This is the reason for rounding to the nearest representable number &mdash; to reduce error
introduced by rounding. It's also the [reason to use banker's rounding](https://stackoverflow.com/questions/45223778/is-bankers-rounding-really-more-numerically-stable) rather than the more familiar rule we learn in school (round ties away from zero).

So why do what Excel does? Excel's behavior gives you the following property: no number it displays
will contain a significant digit that's different from one you typed. By limiting to 15 significant
decimal places, it can
guarantee that the truncated number is precisely representable. And by truncating instead of
rounding, it can guarantee that the significant digits that remain are exactly the same as the
input.

I imagine this is the property that they wanted. An Excel user might feel, if they
typed 9,007,199,254,740,993 and got back 9,007,199,254,740,992, that this was a bug. Or, potentially
worse, wouldn't even realize it had changed, and would later wrongly infer that the number they
entered was 9,007,199,254,740,992.

Of course, the actual behavior might also appear to be a bug, but I imagine it is easier to explain
"we only support 15 significant digits of precision" than it is to explain binary64 in all its
complex glory. Is it less surprising for a 2 to become a 0 than a 4? I guess, maybe.

It's worth noting that Google sheets emulates Excel exactly here. Is that just extreme dedication to
Excel-compatibility? Or is it because they agree that this behavior is desirable?

The cost of this is that Excel sacrifices more precision than is strictly necessary. Personally, I'm
not sure that trade-off is worth it.



