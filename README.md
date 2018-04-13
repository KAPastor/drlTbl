# drlTbl
drlTbl is shorthand for Drill Table.  The idea is to make table drilldowns a bit easier and more managable.

Imagine you have a bunch of table data, but some of the data are subsets of each other.  For example, a table of employee positions and below this the actual employees with those positions. 
``` html
    <table id="position-employee">
      <thead><th>Position/Employee</th><th>Salary</th></thead>
      <tr depth="1"><td>Managing Director</td><td drlcalc="sum"></td></tr>
      <tr depth="2"><td>John Foreman</td><td drlpre="$" drlpost="/year">25000</td></tr>
      <tr depth="1"><td>Associate Director</td><td drlcalc="sum"></td></tr>
      <tr depth="2"><td>Sandra Rooney</td><td drlpre="$" drlpost="/year">25000</td></tr>
      <tr depth="2"><td>Tod Mullson</td><td drlpre="$" drlpost="/year">25000</td></tr>
      <tr depth="1"><td>Intern</td><td drlcalc="sum"></td></tr>
      <tr depth="2"><td>Ted</td><td drlpre="$" drlpost="/year">25000</td></tr>
      <tr depth="2"><td>Other Ted</td><td drlpre="$" drlpost="/year">25000</td></tr>
    </table>
```
You can see that under Associate Director we have two employees.  What we want is the table to have thre
