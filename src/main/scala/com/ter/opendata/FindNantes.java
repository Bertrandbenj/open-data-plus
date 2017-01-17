package com.ter.opendata;

import org.apache.spark.sql.Encoders;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.apache.spark.storage.StorageLevel;

import scala.Tuple2;

import static org.apache.spark.sql.functions.concat;

import java.util.function.IntFunction;

import static org.apache.spark.sql.functions.col;

import org.apache.spark.api.java.function.FilterFunction;
import org.apache.spark.sql.Dataset;

public class FindNantes {

	public static void main(String[] args) {
		SparkSession spark = SparkSession
				.builder()
				.master("local[*]")
				.config("spark.executor.memory", "3g")
				.appName("parquetReader")
				.getOrCreate();
		
		
		// Load quads 
		Dataset<Quad> quads = //Main.fromRowFile(spark,Main.SAMPLE_GZ)
				spark.read().parquet("results/parquet_Jsonid")
				.as(Encoders.bean(Quad.class))
				// serialized means smaller in memory and more computation
				//.persist(StorageLevel.MEMORY_AND_DISK_SER())
				;
		quads.show(100);
		System.out.println("Quads found : " + quads.count());
		
		
		Dataset<Quad> nantes = quads
				.filter(quad -> quad.isNantes())
				.cache();

		nantes.select("graph","subject","predicate","object").show(false);
		System.out.println("Nantes : "+ nantes.count());
		Object[] nodeIDs = nantes.collectAsList().stream().map(q-> q.uniqueSubjectID()).toArray();
		
		
		Dataset<Quad> nantes_1 = quads
				.except(nantes)
				//.withColumn("subid", concat(col("graph"),col("subject")))
				.filter(concat(col("graph"),col("subject")).isin(nodeIDs))
				.orderBy("graph","subject")
				.cache();
				
		nantes_1.select("graph","subject","predicate","object").show(500, false);
		System.out.println("Nantes_1 : " + nantes_1.count());
		Object[] newNodeIDs = nantes.collectAsList().stream().map(q-> q.uniqueSubjectID()).toArray();
		

		
		Main.keepAlive(5);
			
	}

}
