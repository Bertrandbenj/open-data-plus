package com.ter.opendata;

import java.io.Serializable;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.spark.sql.Dataset;


public class Quad implements Serializable {
	
	private static final long serialVersionUID = -6797868860298931115L;
	
	private String graph;
	private String subject;
	private String predicate;
	private String object;
	
	public Quad(){}

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
	public boolean isNantes() {
		return (	predicate.equals("<http://schema.org/addressLocality>") 
				|| 	predicate.equals("<http://schema.org/keywords>")
				|| 	predicate.equals("<http://schema.org/name>") )  && object.contains("Nantes")
				;
	}

	public static class Factory {
		
		static String uri = "<(?:[^>]+)>";
		static String bNode = "_:(?:[A-Za-z][A-Za-z0-9\\-_]*)";
		// the string pattern matching filters out empty string ""^^xsd:String
		static String str = "\"[^\"]+\"(?:@(?:[a-z]+[\\-A-Za-z0-9]*)|\\^\\^<(?:[^>]+)>)?";
		static Pattern nqMatcher3 = Pattern.compile("^("+uri+"|"+bNode+")\\s+("+uri+")\\s+("+uri+"|"+str+"|"+bNode+"|)\\s+("+uri+")\\s+\\.$");
		
	
		public static Quad build(String s){
		
		try{
			Quad res = new Quad();
			Matcher m = nqMatcher3.matcher(s);
			if(m.matches()){
				//System.out.println("match : "+m.group(1)+" "+m.group(2)+" "+m.group(3)+" "+m.group(4));
				res.setGraph(m.group(4));
				res.setSubject(m.group(1));
				res.setPredicate(m.group(2));
				res.setObject(m.group(3));
				return res;
			}else{
//				if(!s.contains("\"\"^^"))
//					System.out.println("couldnt parse : "+s);
			}
		}catch(Exception e){
			System.err.println("couldnt parse : "+s+"\n"+e);
		}
		return null;
	}
}

	
	public String uniqueSubjectID(){
		return subject.startsWith("_:")?graph+subject:subject;
	}




}
