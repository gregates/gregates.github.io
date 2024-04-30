+++
title = "The rise of -n"
date = 2024-04-04
+++

One of my favorite public datasets is the baby name data published every year by
the United States Social Security Administration (SSA). When I joined
[Row Zero](https://rowzero.io), one of the first things I did was gather this data
into a single csv (it's published as one csv per year) and upload it to S3 for us
to use as a test dataset. It's nice because it's not too big &mdash; less than 8 KiB
gzipped &mdash; but it's still too big for Excel since it has more than 2 million rows.

We've done a lot of fun ad hoc analyses of this data set. One of my colleagues produced
a graph of baby name popularity over time by final letter, which prompted me to do
a deeper dive on the popularity of baby boy names ending in with the letter n, and
specifically with the suffix -ayden, -aiden, or -aden. I published that on Row Zero's blog. 
You can read it here: [The Rise of -n](https://rowzero.io/blog/baby-names-rise-of-n).
That blog post also has a link to a Row Zero workbook containing all the SSA baby name
data from 1880 to 2022, which you can copy to do your own analysis.

Some fun takeaways:

* The most popular final letter for baby boys in the U.S. has been n since 1963.
* The most popular final letter for baby girls in the U.S. has been a since 1935.
* Peak popularity of boy names ending in n was in 2011, at 36.4% of all baby boy names
in the SSA data.
* Although -n names are broadly popular, the peak in 2011 was driven specifically by
-aiden, -ayden, and -aden names, without which the peak would have been earlier and lower.
* Among Gen Z boys in the U.S., 2.6% have names ending in -ayden, -aiden, or -aden. This is a little
  bit higher than the popularity of Matthew for Millenials.

Again, you can read the full analysis (including graphs!) over at [Row Zero's
blog](https://rowzero.io/blog/baby-names-rise-of-n).
