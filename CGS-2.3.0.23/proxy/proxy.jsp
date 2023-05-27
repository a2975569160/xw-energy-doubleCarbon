<%@page import="java.net.*"%>
<%@page import="java.io.*"%>
<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
	String param = request.getParameter("address");
	if(param != null){
        if(param.startsWith("?")){
			param = param.substring(1);
		}
		URL url = new URL(param);
		URLConnection connection = url.openConnection();
		connection.setConnectTimeout(2000);
		connection.connect();
		InputStream is = connection.getInputStream();
		//response.setContentType("text/html");
		OutputStream outputs = response.getOutputStream();
		
		byte[] buffer = new byte[1024];
		
		int len = 0;
		while((len = is.read(buffer))>0){
			outputs.write(buffer, 0, len);
		}
		outputs.flush();
		outputs.close();
		outputs = null;
		out.clear();
		out = pageContext.pushBody();
	}
%>
