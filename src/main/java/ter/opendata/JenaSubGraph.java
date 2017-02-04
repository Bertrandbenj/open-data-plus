package ter.opendata;

import java.io.IOException;

import org.apache.spark.sql.SparkSession;

public class JenaSubGraph {
	public static void main(String[] args) throws IOException {

		Main.keepAlive(0);

		// Init Spark
		SparkSession spark = SparkSession.builder()
				.master("local[*]")
				.config("spark.executor.memory", "3g")
				.appName("OpenData+")
				.getOrCreate();
		
		
		
	}
}
