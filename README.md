# Capstone project Open Data Plus
Extraction techniques used to find content related to Nantes in Web Data Commons.

* [Read & Convert raw data](https://www.zeppelinhub.com/viewer/notebooks/bm90ZTovL2JlcnRyYW5kYmVuai9OYW50aUNyYXdsLzJjMzJlYTRkNWM1YzQ0NmZhYmNhNzc5NDQ0MTQ2NzUzL25vdGUuanNvbg)
* [NantiCrawl](https://www.zeppelinhub.com/viewer/notebooks/bm90ZTovL2JlcnRyYW5kYmVuai9OYW50aUNyYXdsLzdlNTMxMTM0ZmFkMjQ2NzA4ZTgxNWZlNmYyZGQ2MDFkL25vdGUuanNvbg)

# Table of contents
* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Cluster setup](#cluster-setup)
  * [Configuration files](#configuration-files)
  * [Deployment](#deployment)
* [Usage](#usage)
* [License](#license)
* [Authors](#authors)

# Prerequisites
* [Scala](http://www.scala-lang.org/) version 2.11
* [Apache Hadoop](https://hadoop.apache.org/) version 2.6.5
* [Apache Spark](https://spark.apache.org/) version 2.0.1
* [Maven](https://maven.apache.org/)

# Installation

Clone the repository and then build it using Maven
```bash
git clone https://github.com/Callidon/open-data-plus.git
cd open-data-plus/
mvn package
```

# Cluster setup

* Install Hadoop on every machine of the cluster (master + slaves)
* Install Apache Spark on the master
* Create/edit the following configuration files

## Configuration files

All configuration files must be placed in `$HADOOP_HOME/etc/hadoop`.

### Master

* `slaves`: This file lists the hosts, one per line. It should not contains the IP address of the master!

### Master and slaves

* `core-site.xml`: replace `$HOSTNAME` by the IP address of the current host (ex: 172.16.134.152), and `$HADOOP_DIR` by the location where files will be stored by the HDFS (make sure you have enough space!)
```xml
<configuration> 
  <property> 
    <name>fs.defaultFS</name> 
    <value>hdfs://$HOSTNAME:9000</value> 
  </property>
  <property>
  	<name>hadoop.tmp.dir</name>
  	<value>$HADOOP_DIR/tmp/hadoop-${user.name}</value>
  </property>
</configuration>
```

* `yarn-site.xml`: replace `$MASTER_HOST` by the IP address of the master (ex: 172.16.134.152)
```xml
<configuration>
	<property>
        <name>yarn.resourcemanager.hostname</name>
        <value>$MASTER_HOST</value>
    </property>
    <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
    </property>
    <property>
        <name>yarn.nodemanager.aux-services.mapreduce_shuffle.class</name>
        <value>org.apache.hadoop.mapred.ShuffleHandler</value>
    </property>
</configuration>
```

* `mapred-site.xml`: replace `$MASTER_HOST` by the IP address of the master (ex: 172.16.134.152)
```xml
<configuration>
	<property>
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
    </property>
    <property> 
      <name>mapred.job.tracker</name> 
      <value>$MASTER_HOST:9001</value> 
   </property>
</configuration>
```

## Deployment

On the master, run the following scripts to start the cluster
```bash
# start master then slaves
$HADOOP_HOME/sbin/start-all.sh

# start YARN resource manager
$HADOOP_HOME/sbin/start-yarn.sh
```

To ensure that the cluster is running correctly, run the `jsp` command on each machine.

On the master, you should see :
* Namenode
* Resource Manager
* SecondaryNamenode
* JSP

On any slave, you should see :
* Datanode
* JSP

You can access Hadoop application's control panel at `http://localhost:50070`(on the master).

On the master, run the following scripts to shutdown the cluster
```bash
# stop master then slaves
$HADOOP_HOME/sbin/stop-all.sh

# stop YARN resource manager
$HADOOP_HOME/sbin/stop-yarn.sh
```

# Usage

Once the cluster has been deployed, you must upload all the files you want to evaluate on the Hadoop file system.

Then, you can launch the crawler with the following command:
```bash
spark-submit --class com.alma.opendata.NQuadsSearch --master <spark-master-url> --deploy-mode cluster target/open-data-crawler-1.0-SNAPSHOT-jar-with-dependencies.jar path/to/data/files
```

You can see the progress of the task at `http://localhost:8080`(on the master). **This will also gives you the spark master url.**

## Useful `spark-submit` options :

* `--executor-memory <memory>` can be used to set how many memory slaves will use (by default, 1G).
* `--num-executors <number>` can be used to describes how many executors which will execute the application. We recommend to set this to the number of slaves in the cluster.

# License

[MIT License](https://github.com/Callidon/open-data-plus/blob/master/LICENSE)

# Authors

Adel Benabadji, Hiba Benyahia, Asma Boussalem, Théo Couraud, Pierre Gaultier, Lenny Lucas & Thomas Minier
