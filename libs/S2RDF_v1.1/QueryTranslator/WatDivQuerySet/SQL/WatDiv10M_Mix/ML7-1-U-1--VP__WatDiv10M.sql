SELECT tab0.v1 AS v1 , tab6.v7 AS v7 , tab4.v5 AS v5 , tab5.v6 AS v6 , tab3.v4 AS v4 , tab2.v3 AS v3 , tab1.v2 AS v2 
 FROM    (SELECT obj AS v1 
	 FROM wsdbm__makesPurchase$$1$$
	 
	 WHERE sub = 'wsdbm:User53037'
	) tab0
 JOIN    (SELECT sub AS v1 , obj AS v2 
	 FROM wsdbm__purchaseFor$$2$$
	
	) tab1
 ON(tab0.v1=tab1.v1)
 JOIN    (SELECT obj AS v3 , sub AS v2 
	 FROM rev__hasReview$$3$$
	
	) tab2
 ON(tab1.v2=tab2.v2)
 JOIN    (SELECT obj AS v4 , sub AS v3 
	 FROM rev__reviewer$$4$$
	
	) tab3
 ON(tab2.v3=tab3.v3)
 JOIN    (SELECT obj AS v5 , sub AS v4 
	 FROM wsdbm__follows$$5$$
	
	) tab4
 ON(tab3.v4=tab4.v4)
 JOIN    (SELECT sub AS v5 , obj AS v6 
	 FROM wsdbm__subscribes$$6$$
	
	) tab5
 ON(tab4.v5=tab5.v5)
 JOIN    (SELECT obj AS v7 , sub AS v6 
	 FROM sorg__language$$7$$
	
	) tab6
 ON(tab5.v6=tab6.v6)


++++++Tables Statistic
wsdbm__makesPurchase$$1$$	0	VP	wsdbm__makesPurchase/
	VP	<wsdbm__makesPurchase>	149998
------
wsdbm__follows$$5$$	0	VP	wsdbm__follows/
	VP	<wsdbm__follows>	3289307
------
wsdbm__subscribes$$6$$	0	VP	wsdbm__subscribes/
	VP	<wsdbm__subscribes>	152275
------
rev__reviewer$$4$$	0	VP	rev__reviewer/
	VP	<rev__reviewer>	150000
------
sorg__language$$7$$	0	VP	sorg__language/
	VP	<sorg__language>	6251
------
rev__hasReview$$3$$	0	VP	rev__hasReview/
	VP	<rev__hasReview>	149634
------
wsdbm__purchaseFor$$2$$	0	VP	wsdbm__purchaseFor/
	VP	<wsdbm__purchaseFor>	150000
------
