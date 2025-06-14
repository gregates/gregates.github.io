+++
title = "Excel filter control violates transitivity"
date = 2025-06-13

[extra.og]
image = "/excel-intransitive.webp"
+++

You find a lot of weirdness when you try to implement an Excel compatible spreadsheet. Filters, in
particular, have got to be one of the weirdest spreadsheet features. Today, I learned that the order
in which Excel presents items in its filter control violates transitivity, and hence is not even a
proper partial order.

## How does Excel sort (numeric) filter options?
Consider an Excel sheet with the following initial setup.

```
      A
1  data
2  0.00001
3   0.0001
4    0.001
5      100
6      1.1
7      1.1
```

If you create a filter on column A here, and click the filter control, Excel shows you each of the
**distinct** values in A2:A6 for you to select or unselect. Like this:

```
☑   0.00001
☑   0.0001
☑   0.001
☑   1.1
☑   100
```

Notice that 1.1 is shown only once. That's the first thing to notice.

The second thing to notice is that the options in the checkbox list are sorted in ascending
numerical order. So 1.1 comes before 100, even though 1.1 appears below 100 in the worksheet.

The third thing to notice is that the equivalence relation Excel uses to deduplicate **respects
formatting**. So, for example, if I format A7 as a percentage, then I get the following instead:

```
☑   0.00001
☑   0.0001
☑   0.001
☑   1.1
☑   110%
☑   100
```

Now, the order is *still* numeric. We can see that because 110% is ordered before 100. If these
values were ordered as they appear in the worksheet, or lexicographically, we would expect the
opposite order.

But we now have a tie: there are two values with the numeric
value 1.1. So we need to decide how to break ties. Here Excel does appear to use lexicographical
ordering. Because the character `.` comes before the charater `1` (in ASCII and UTF-8 encoding), 1.1
sorts before 110%. This is true even if we format A6 as percentage rather than A7, so we know it's
not just using the sheet order.

So the rule appears to be:
1. Deduplicate based on the formatted values.
2. Sort in numeric order (ascending), breaking ties with lexicographical order on the formatted
   values.

## Why isn't this a partial order?
To see the transitivity violation in the headline, let's apply some more formatting. Starting from
our original example, let's format A2 and A4 with exactly 2 decimal places of precision. This causes
both to be displayed as `0.00`. And let's format A3 with 3 decimal places of precision, yielding a
display value of `0.000`.

So now Excel treats A2 and A4 as the same, since they display the same. So our list of filter
options is:

```
☑   0.00
☑   0.000
☑   1.1
☑   100
```

Now, that **looks like** we're displaying the options in lexicographical order by display value. But
we've already seen that isn't the case. We're going to make two more edits to demonstrate the issue.

First, let's delete the value in A4. This produces **no change** to the filter options, which is
what we'd expect, because we still have the same set of distinct values.

Ok, now ctrl-Z to undo that. And then let's delete A2. Aha! Now the order of options in the filter
control has changed. We get:

```
☑   0.000
☑   0.00
☑   1.1
☑   100
```

If we think about the algorithm we described in the last section, this is also not surprising,
because the numeric value of A4 is greater than the numeric value of A3, and we only use
lexicographical ordering to break ties. So even though **as text** `0.000` is greater than `0.00`,
it comes first in the list of filter options because the numerical value is smaller.

In other words, for purpose of display in the filter control, A2 < A3, and A3 < A4. If this were a
partial order, that would entail, by transitivity, that A2 < A4. But the equivalence relation we're
using (same display) yields A2 == A4. Transitivity does not hold.

## Why does this matter?
In some ways it doesn't; it would not surprise me if no one has ever noticed this fact about Excel,
even including the people who implemented the filter dialog ordering algorithm (it also wouldn't
surprise me if they had and just were OK with it).

But algorithmically it does matter, if you're trying to implement something similar. For example,
the following two procedures for producing a sorted, deduplicated list should be equivalent:

1. First deduplicate (by collecting into a hash set, say), then sort the deduplicated values.
2. First sort, then deduplicate by removing adjacent elements that are equivalent.

The way Excel's implemented sorting the filter options, these algorithms do not produce the same
result. If we think of them as using one of these procedures on a list of (number, formatted display
value) pairs, where equivalence is based only on the second element but ordering goes by way of
comparing the first element (using the 2nd to break ties), Excel is clearly using the 1st procudure
and not the 2nd one. If they used the 2nd, you'd end up with `0.00` displayed twice in our case,
which would be incorrect.
