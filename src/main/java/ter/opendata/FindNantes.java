package ter.opendata;

import org.apache.spark.api.java.function.MapFunction;
import org.apache.spark.rdd.RDD;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Encoder;
import org.apache.spark.sql.Encoders;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;

import com.github.jsonldjava.impl.NQuadRDFParser;
import com.github.jsonldjava.impl.TurtleRDFParser;

import static org.apache.spark.sql.functions.col;
import static org.apache.spark.sql.functions.concat;
import static org.apache.spark.sql.functions.desc;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;

import org.apache.jena.graph.Triple;
import org.apache.jena.datatypes.RDFDatatype;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.lang.LangNQuads;
import org.apache.jena.riot.lang.PipedQuadsStream;
import org.apache.jena.riot.lang.PipedRDFIterator;
import net.sansa_stack.rdf.spark.io.NTripleReader;
public class FindNantes {

	public static void main(String[] args) {
		
	
		SparkSession spark = SparkSession
				.builder()
				.master("local[*]")
				.config("spark.executor.memory", "3g")
				.config("log4j.logger.org.apache.spark", "WARN")
				.appName("NantesFinder")
				.getOrCreate();
		
//		RDD<Triple> rdd = NTripleReader.load(spark, new File("dump/dpef.html-embedded-jsonld.nq-00000.gz"));
//		System.out.println(rdd.count());
		
		// LOAD DATA  
		Dataset<Quad> quads = 
				//Main.fromRowFile(spark,Main.SAMPLE_GZ)
				spark.read().parquet("results/one")
				.as(Encoders.bean(Quad.class))
				//.limit(10000000)
				// serialized means smaller in memory and more computation
				// This may also overload the Disk I/O if there is to little memory in the cluster
				//.persist(StorageLevel.MEMORY_AND_DISK_SER())
				;
		final PipedRDFIterator<org.apache.jena.sparql.core.Quad> it = new PipedRDFIterator<>();
        final PipedQuadsStream out = new PipedQuadsStream(it);
		
		RDFDataMgr.parse(out, new ByteArrayInputStream("_:node60a0cb55a4c3b6c17c6dcbb1247ba668 <http://data-vocabulary.org/Breadcrumb/title> \"Literature\" <http://0xwhaii.deviantart.com/art/Punk-America-X-DJ-Reader-Hot-Damn-VIII-310447740>   .".getBytes()), null, Lang.NQUADS);
		org.apache.jena.sparql.core.Quad q = it.next();
		System.out.println(q+"\n\t"+q.asTriple());
		//RDFDataMgr.createReader(Lang.NQUADS).
		Dataset<org.apache.jena.sparql.core.Quad> rdd = spark.read()
			.textFile("dump/dpef.html-microdata.nq-00005.gz")
			.map(f -> {
				try{
					final PipedRDFIterator<org.apache.jena.sparql.core.Quad> it2 = new PipedRDFIterator<>();
			        
					RDFDataMgr.parse(
							new PipedQuadsStream(it2), 
							new ByteArrayInputStream(f.getBytes(StandardCharsets.UTF_8)), 
							null, 
							Lang.NQUADS);
					
					org.apache.jena.sparql.core.Quad res= it2.next();
					
					return res;
				}catch(Exception e){
					return null;
				}
					
				}
				, Encoders.kryo(org.apache.jena.sparql.core.Quad.class)
			);
		rdd.foreach(quad -> {
			System.out.println(quad);
		});;
		try {
			Thread.sleep(10000);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		quads.show();
		quads.createOrReplaceTempView("quads");
		System.out.println("Quads found : " + quads.count());
		
		// MOST POPULAR PREDICATE 
		quads.groupBy("predicate").count().orderBy(desc("count")).show(false);
		
		// INITIAL NANTES
		// Create our dataset based on triples matching specific predicate 
		Dataset<Quad> nantes = quads
				.filter(quad -> quad.isNantes())
				.cache()
				;
		
		nantes.select("graph","subject","predicate","object").show(false);
		
		// SEARCH LAYER BY LAYER 
		nantes = sqlSearch(nantes, spark).as(Quad.enc);
		
		//broadcastSearch(nantes, quads);
		//flatmappingSearch(nantes, quads);

		
		// Daemonize for a few minutes to observe the Spark GUI
		Main.keepAlive(10);
			
	}
	
	public static void flatmappingSearch(Dataset<Quad> hop, Dataset<Quad>  quads ){
		
		hop.map(q -> q.getGraph(), Encoders.STRING())
				// .flatMap(t ->
				// Arrays.asList(t.getUniqueSubject(),t.getUniqueObject()).iterator(),
				// Encoders.STRING())
				.distinct().collectAsList();
		hop = hop.join(quads, col("graph").as("qGraph").isin(hop.col("graph").as("hopGraph")))
				.as(Encoders.bean(Quad.class))
				// .map(tuple2 -> tuple2._2, Encoders.bean(Quad.class))
				.distinct().repartition(8).cache();
		hop.select("graph", "subject", "predicate", "object").show(false);
		System.out.println("At rank " + " " + hop.count() + " quad");
	}
	
	/**
	 * Collect the list of unique object (graph+object) and propagate 
	 * @param nantes
	 * @param quads
	 * @return
	 */
	public static Dataset<Quad> broadcastSearch(Dataset<Quad> nantes, Dataset<Quad>  quads ){
		Object[] nodeIDs = nantes
				.map(q -> q.getUniqueObject(), Encoders.STRING())
				.collectAsList()
				.toArray();
		
		
		Dataset<Quad> nantes_1 = quads
				.except(nantes)
				//.withColumn("subid", concat(col("graph"),col("subject")))
				.filter(concat(col("graph"),col("subject")).isin(nodeIDs))
				.orderBy("graph","subject")
				.cache();
				
		nantes_1.select("graph","subject","predicate","object").show(500, false);
		System.out.println("Nantes_1 : " + nantes_1.count());
		//Object[] newNodeIDs = nantes.collectAsList().stream().map(q-> q.getUniqueSubject()).toArray();
		return nantes_1;
	}
	
	public static Dataset<Row> sqlSearch(Dataset<Quad> nantes, SparkSession spark ){
		nantes.createOrReplaceTempView("nantes");
		
		long curCount = nantes.count();
		
		Dataset<Row> hop = null;
		boolean finished = false;
		for(int rank = 0; rank<3 && !finished  ;rank++){
			hop = spark.sql(
							"SELECT DISTINCT "
							+ "q.graph,q.subject,q.predicate,q.object "
							+ "FROM quads q JOIN nantes n "
							+ "ON q.graph = n.graph ")
					.repartition(8)			// twice the CPU number
					.cache();
			hop.createOrReplaceTempView("nantes");
			
			if(hop.count() <= curCount){
				finished=true;
				System.out.println("======== FINISHED GRAPH ============");
			}else{
				System.out.println("======== "+curCount+" -> "+hop.count()+" graph elements  ============");
				curCount=hop.count();	
			}
			System.out.println("Nantes at rank "+rank+" : "+ hop.count());
			
			hop.show(false);
		}
		return hop;
	}

}
