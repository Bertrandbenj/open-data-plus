package com.ter.opendata;

import java.io.Serializable;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Encoders;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;

import static org.apache.spark.sql.functions.col;
public class Main {

	public static void main(String[] args) {
		SparkSession spark = SparkSession
				.builder()
				.master("local[*]")
				.appName("OpenData+")
				.getOrCreate();
		
		JavaRDD<Quad> quad= spark.read()
			.textFile("src/main/resources/data16.nq")
			.toJavaRDD()
			.map(s -> new Quad(s));
		
		Dataset<Row> quads = spark.createDataFrame(quad, Quad.class);
		
		quads.select("graph","subject","predicate","object")
			.show(false);
		
		quads.as(Encoders.bean(Quad.class))
			.filter(col("graph").like("%Punk%"))
			.show();
		
		quads.write().parquet("results/parq");
		
		
		
		// just so the Spark GUI stays up long enough to look at it 
		new Thread(()-> {
			try{
				Thread.sleep(5 * 60 * 1000);
			}catch(Exception e){
				e.printStackTrace();
			}
		}).start();
		//Statement stmt = ResourceFactory.createStatement();

	}

	static final Pattern nqMatcher = Pattern
			.compile("(<[^\\s]+>|_:(?:[A-Za-z][A-Za-z0-9\\-_]*))\\s+(<[^\\s]+>)\\s+(<[^\\s]+>|_:(?:[A-Za-z][A-Za-z0-9\\-_]*)|\\\"(?:(?:\\\"|[^\"])*)\"(?:@(?:[a-z]+[\\-A-Za-z0-9]*)|\\^\\^<(?:[^>]+)>)?)\\s+(<[^\\s]+>).*");
	
	public static class Quad implements Serializable {
		private static final long serialVersionUID = -6797868860298931115L;
		private String graph;
		private String subject;
		private String predicate;
		private String object;
		
		public Quad(){
		}
		
		public Quad(String s){
			this();
			Matcher m = nqMatcher.matcher(s);
			if(m.matches()){
				this.graph = m.group(1);
				this.subject = m.group(2);
				this.predicate = m.group(3);
				this.object = m.group(4);
			}else{
				System.err.println("couldn't parse : "+s);
			}
		}
		
		public Quad(String graph, String subject, String predicate, String object) {
			setGraph (graph);
			setSubject(subject);
			setPredicate(predicate);
			setObject(object);
		}

		public String getGraph() {
			return graph;
		}
		public void setGraph(String graph) {
			this.graph = graph;
		}
		public String getSubject() {
			return subject;
		}
		public void setSubject(String subject) {
			this.subject = subject;
		}
		public String getPredicate() {
			return predicate;
		}
		public void setPredicate(String predicate) {
			this.predicate = predicate;
		}
		public String getObject() {
			return object;
		}
		public void setObject(String object) {
			this.object = object;
		}
	
	}
}
