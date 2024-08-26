+++
title = "Big data is dead. So what?"
date = 2024-08-10
+++

In a 2023 blog post, Jordan Tigani, one of the engineers who created Google BigQuery, declared that
[big data is dead](https://motherduck.com/blog/big-data-is-dead/). We at [Row
Zero](https://rowzero.io) agree with the main thrust of his argument, which is that you don't
actually need distributed computing for most of your data analysis work. But when I read that post,
and his [more recent post](https://motherduck.com/blog/redshift-files-hunt-for-big-data/) making a
similar argument, I am left wondering: so what?

The implicit conclusion the reader is meant to take away is that we can stop using tools that were
sold to use as solutions to our big data problems (Snowflake, Databricks, BigQuery, Hadoop, etc.)
and start using analysis tools that don't promise to handle data of
unbounded size: your DuckDBs and your Row Zeros, for example. I'm (obviously) sympathetic to that
conclusion, but there's a missing step in the argument. Maybe we can usually avoid these big
distributed databases, but should we?

## Not a new argument

In some ways, Tigani's argument is not new. Here's a blog post that's 10 years older by Chris
Stucchio making much the same point:
[Don't use Hadoop - your data isn't that big](https://www.chrisstucchio.com/blog/2013/hadoop_hatred.html).
In 2013, the big data landscape was quite different. BigQuery, Snowflake, and Databricks were new
products, launched in 2011, 2012, and 2013 respectively, and completely unmentioned in the post.
Apache Hadoop was a better known, open source tool for distributing data processing, launched in
2006, just two years after the
[Google MapReduce paper](https://static.googleusercontent.com/media/research.google.com/en//archive/mapreduce-osdi04.pdf)
that famously introduced many to the technique of distributing data processing. But compared to
those managed offerings, it's much harder to set up and use. So Stucchio cautions against doing so
when it's not really necessary.

In that post, Stucchio lists several tools for data analysis and when it's appropriate to use them:

* Excel: when your data fits within Excel's software limits, <100 MB or so.
* Pandas, R, Matlab: when your data fits in memory (up to tens of GB).
* SQL database (postgres): when your data fits on a single hard drive (<5 TB or so, in 2013).
* Hadoop: when you actually need multiple computers (>5 TB or so).

The reason to prefer Excel to R, or SQL to Hadoop, is ease of use. You'll extract
insights from your data faster and more efficiently by using the simplest tool you can.


## "Big data" is a marketing term

Today, Tigani puts the "big data" threshold at 10 TB rather than 5, and one of his premises is that
the point at which you have to use distributed computing keeps getting bigger over time. Big data
tools were marketed, over the last decade, with the promise that your data was going to grow faster
than this threshold. Even if you didn't need fancy tools like Hadoop **yet**, you surely would in
the near future. But that hasn't necessarily come to pass.

When I was at Tableau, doing performance analysis, all the data I worked with was in Snowflake. One
of our tables was huge &mdash; it contained detailed, trace-level data for every API request to
Tableau Cloud. It was so big that, with the warehouse size I had access to and the query timeouts
configured for me, it wasn't actually possible to run a query that did a full table scan. So all my
analysis took the form of using Snowflake to filter the data, then exporting to Tableau to do my
actual analysis on a subset of the data. The theoretical power of Snowflake went unused, mostly. In
theory we could have used a much bigger warehouse and let the queries run longer, and crunched the
whole table. But that sort of power was too expensive to put in the hands of a lowly performance
engineer like myself.
