SELECT tab0.v1 AS v1 , tab6.v7 AS v7 , tab4.v5 AS v5 , tab5.v6 AS v6 , tab3.v4 AS v4 , tab8.v9 AS v9 , tab2.v3 AS v3 , tab7.v8 AS v8 , tab1.v2 AS v2 
 FROM    (SELECT obj AS v1 
	 FROM wsdbm__follows$$1$$
	 
	 WHERE sub = 'wsdbm:User3768'
	) tab0
 JOIN    (SELECT sub AS v1 , obj AS v2 
	 FROM wsdbm__makesPurchase$$2$$
	
	) tab1
 ON(tab0.v1=tab1.v1)
 JOIN    (SELECT obj AS v3 , sub AS v2 
	 FROM wsdbm__purchaseFor$$3$$
	
	) tab2
 ON(tab1.v2=tab2.v2)
 JOIN    (SELECT obj AS v4 , sub AS v3 
	 FROM rev__hasReview$$4$$
	
	) tab3
 ON(tab2.v3=tab3.v3)
 JOIN    (SELECT obj AS v5 , sub AS v4 
	 FROM rev__reviewer$$5$$
	
	) tab4
 ON(tab3.v4=tab4.v4)
 JOIN    (SELECT sub AS v5 , obj AS v6 
	 FROM wsdbm__likes$$6$$
	) tab5
 ON(tab4.v5=tab5.v5)
 JOIN    (SELECT obj AS v7 , sub AS v6 
	 FROM sorg__actor$$7$$
	) tab6
 ON(tab5.v6=tab6.v6)
 JOIN    (SELECT sub AS v7 , obj AS v8 
	 FROM wsdbm__friendOf$$8$$
	
	) tab7
 ON(tab6.v7=tab7.v7)
 JOIN    (SELECT obj AS v9 , sub AS v8 
	 FROM sorg__telephone$$9$$
	
	) tab8
 ON(tab7.v8=tab8.v8)


++++++Tables Statistic
sorg__actor$$7$$	2	OS	sorg__actor/wsdbm__friendOf
	VP	<sorg__actor>	1668
	SO	<sorg__actor><wsdbm__likes>	1634	0.98
	OS	<sorg__actor><wsdbm__friendOf>	666	0.4
------
wsdbm__likes$$6$$	2	OS	wsdbm__likes/sorg__actor
	VP	<wsdbm__likes>	11256
	SO	<wsdbm__likes><rev__reviewer>	3219	0.29
	OS	<wsdbm__likes><sorg__actor>	740	0.07
------
wsdbm__friendOf$$8$$	2	OS	wsdbm__friendOf/sorg__telephone
	VP	<wsdbm__friendOf>	448135
	SO	<wsdbm__friendOf><sorg__actor>	52584	0.12
	OS	<wsdbm__friendOf><sorg__telephone>	22194	0.05
------
rev__reviewer$$5$$	2	OS	rev__reviewer/wsdbm__likes
	VP	<rev__reviewer>	15000
	SO	<rev__reviewer><rev__hasReview>	14757	0.98
	OS	<rev__reviewer><wsdbm__likes>	3568	0.24
------
rev__hasReview$$4$$	1	SO	rev__hasReview/wsdbm__purchaseFor
	VP	<rev__hasReview>	14757
	SO	<rev__hasReview><wsdbm__purchaseFor>	11081	0.75
	OS	<rev__hasReview><rev__reviewer>	14757	1.0
------
wsdbm__purchaseFor$$3$$	2	OS	wsdbm__purchaseFor/rev__hasReview
	VP	<wsdbm__purchaseFor>	15000
	SO	<wsdbm__purchaseFor><wsdbm__makesPurchase>	15000	1.0
	OS	<wsdbm__purchaseFor><rev__hasReview>	3465	0.23
------
wsdbm__makesPurchase$$2$$	0	VP	wsdbm__makesPurchase/
	VP	<wsdbm__makesPurchase>	15000
	SO	<wsdbm__makesPurchase><wsdbm__follows>	15000	1.0
	OS	<wsdbm__makesPurchase><wsdbm__purchaseFor>	15000	1.0
------
sorg__telephone$$9$$	1	SO	sorg__telephone/wsdbm__friendOf
	VP	<sorg__telephone>	577
	SO	<sorg__telephone><wsdbm__friendOf>	494	0.86
------
wsdbm__follows$$1$$	1	OS	wsdbm__follows/wsdbm__makesPurchase
	VP	<wsdbm__follows>	330403
	OS	<wsdbm__follows><wsdbm__makesPurchase>	82788	0.25
------
