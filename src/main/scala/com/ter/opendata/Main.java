package com.ter.opendata;

import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.util.Arrays;
import java.util.List;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.io.FileUtils;
import org.apache.jena.graph.Triple;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.function.MapFunction;
import org.apache.spark.rdd.RDD;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Encoders;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.apache.spark.storage.StorageLevel;

import com.github.jsonldjava.core.RDFDataset;
import com.github.jsonldjava.core.RDFDatasetUtils;
import com.github.jsonldjava.impl.TurtleRDFParser;

import static org.apache.spark.sql.functions.col;
import net.sansa_stack.rdf.spark.io.NTripleReader;;

public class Main {

	public static String TEST_DATA = "src/main/resources/test.nq";
	public static String ALL_GZ[] = {
			"dump/dpef.html-embedded-jsonld.nq-00***.gz",
			"dump/dpef.html-mf-adr.nq-00***.gz",
			"dump/dpef.html-mf-geo.nq-00***.gz",
			"dump/dpef.html-mf-hcalendar.nq-00***.gz",
			"dump/dpef.html-mf-hcard.nq-00***.gz",
			"dump/dpef.html-mf-hlisting.nq-00***.gz",
			"dump/dpef.html-mf-hrecipe.nq-00***.gz",
			"dump/dpef.html-mf-hresume.nq-00***.gz",
			"dump/dpef.html-mf-hreview.nq-00***.gz",
			"dump/dpef.html-mf-xfn.nq-00***.gz",
			"dump/dpef.html-microdata.nq-00***.gz"};
	public static String[] SAMPLE_GZ = {
			"dump/dpef.html-embedded-jsonld.nq-00000.gz",
			"dump/dpef.html-mf-adr.nq-00000.gz",
			"dump/dpef.html-mf-geo.nq-00000.gz",
			"dump/dpef.html-mf-hcalendar.nq-00000.gz",
			"dump/dpef.html-mf-hcard.nq-00000.gz",
			"dump/dpef.html-mf-hlisting.nq-00000.gz",
			"dump/dpef.html-mf-hrecipe.nq-00000.gz",
			"dump/dpef.html-mf-hresume.nq-00000.gz",
			"dump/dpef.html-mf-hreview.nq-00000.gz",
			"dump/dpef.html-mf-xfn.nq-00000.gz",
			"dump/dpef.html-microdata.nq-00000.gz"};
	
	public static void main(String[] args) throws IOException {

		keepAlive(0);
		// Init Spark 
		SparkSession spark = SparkSession
				.builder()
				.master("local[*]")
				.config("spark.executor.memory", "3g")
				.appName("OpenData+")
				.getOrCreate();
	
		
//		asJena(spark,TEST_DATA)
//			.map(q -> q, Encoders.bean(RDFDataset.Quad.class))
//			.show();
		
		
		// overwrite the previous parquet
		FileUtils.deleteDirectory(new File("results/parq"));
		
		fromRowFile(spark, SAMPLE_GZ)
			.write()
			//.partitionBy("graph")
			.parquet("results/parq");
	
		spark.read()
			.parquet("results/parq")
			.select("graph","subject","predicate","object")
			.show(50);

	}
	
	/**
	 * map RDD into Dataset/Dataframe/SQL
	 * @param spark
	 * @return
	 */
	public static Dataset<Quad> fromRowFile(SparkSession spark, String... file){
		return spark.read()				
			.textFile(file)				
			.map(s -> Quad.Factory.build(s), Quad.enc)
			.filter(q -> q != null)		// unfortonately spark map isn't filtering null
			;
	}
	

	public static RDD<Triple> fromSansaFile(SparkSession spark, String... file){
		
		RDD<Triple> origin = null;
		
		for(String f : file){
			RDD<Triple> newRDD = NTripleReader.load(spark, new File(f));
			origin = (origin == null)? newRDD : origin.union(newRDD);
		}

		return origin;
	}
	
	
	
	public static Dataset<RDFDataset.Quad> asJena(SparkSession spark, String... file){
//		RDFDatasetUtils.parseNQuads(input)
		return spark.read()				
				.textFile(file)	
				.flatMap(line -> RDFDatasetUtils.parseNQuads(line).getQuads(line).iterator(), Encoders.bean(RDFDataset.Quad.class))
				;
	}
	
	/**
	 * just so the Spark GUI stays up long enough to look at it 
	 * @param min Minutes to keep alive
	 */
	public static void keepAlive(int min){
		new Thread(()-> {
			try{
				Thread.sleep(min * 60 * 1000);
			}catch(Exception e){
				e.printStackTrace();
			}
		},"keepAlive").start();
	}
	

}
