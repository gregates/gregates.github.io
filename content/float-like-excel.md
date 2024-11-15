+++
title = "Float like Excel"
date = 2024-10-10
draft = true
+++

In a [Row Zero](https://rowzero.io/home) workbook, all numeric values are stored as [IEEE
754](https://en.wikipedia.org/wiki/IEEE_754) binary64 values, more commonly known as
double-precision floats, or "doubles". This binary type has several virtues, but also can behave in
ways that deviate from what most people expect from numbers. For example, 0 and -0 are distinct
double values, but not distinct numbers.

Excel does the same, except they [don't exactly adhere to IEEE
standard](https://learn.microsoft.com/en-us/office/troubleshoot/excel/floating-point-arithmetic-inaccurate-result#cases-in-which-we-dont-adhere-to-ieee-754). But it's pretty close.

It's no secret that we use the rust programming language at Row Zero. So
initially Row Zero inherited a lot of implementation details about numbers from rust's
[`f64`](https://doc.rust-lang.org/std/primitive.f64.html) type, which also implements the standard.

However, the standard leaves quite a bit of detail unspecified, at least when it comes to how to
present doubles as decimal numbers for a human to read.
