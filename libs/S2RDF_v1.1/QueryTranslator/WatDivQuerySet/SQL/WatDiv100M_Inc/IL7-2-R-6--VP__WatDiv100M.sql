SELECT tab0.v1 AS v1 , tab6.v7 AS v7 , tab4.v5 AS v5 , tab5.v6 AS v6 , tab3.v4 AS v4 , tab2.v3 AS v3 , tab1.v2 AS v2 
 FROM    (SELECT obj AS v1 
	 FROM gr__offers$$1$$ 
	 WHERE sub = 'wsdbm:Retailer2683'
	) tab0
 JOIN    (SELECT sub AS v1 , obj AS v2 
	 FROM gr__includes$$2$$
	) tab1
 ON(tab0.v1=tab1.v1)
 JOIN    (SELECT obj AS v3 , sub AS v2 
	 FROM sorg__director$$3$$
	
	) tab2
 ON(tab1.v2=tab2.v2)
 JOIN    (SELECT obj AS v4 , sub AS v3 
	 FROM wsdbm__friendOf$$4$$
	
	) tab3
 ON(tab2.v3=tab3.v3)
 JOIN    (SELECT obj AS v5 , sub AS v4 
	 FROM wsdbm__friendOf$$5$$
	
	) tab4
 ON(tab3.v4=tab4.v4)
 JOIN    (SELECT sub AS v5 , obj AS v6 
	 FROM wsdbm__likes$$6$$
	) tab5
 ON(tab4.v5=tab5.v5)
 JOIN    (SELECT obj AS v7 , sub AS v6 
	 FROM sorg__editor$$7$$
	) tab6
 ON(tab5.v6=tab6.v6)


++++++Tables Statistic
wsdbm__likes$$6$$	0	VP	wsdbm__likes/
	VP	<wsdbm__likes>	1124672
------
sorg__director$$3$$	0	VP	sorg__director/
	VP	<sorg__director>	13212
------
gr__offers$$1$$	0	VP	gr__offers/
	VP	<gr__offers>	1420053
------
sorg__editor$$7$$	0	VP	sorg__editor/
	VP	<sorg__editor>	16107
------
wsdbm__friendOf$$4$$	0	VP	wsdbm__friendOf/
	VP	<wsdbm__friendOf>	45092208
------
gr__includes$$2$$	0	VP	gr__includes/
	VP	<gr__includes>	900000
------
wsdbm__friendOf$$5$$	0	VP	wsdbm__friendOf/
	VP	<wsdbm__friendOf>	45092208
------
