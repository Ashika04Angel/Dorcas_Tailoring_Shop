# Must use 10.1 to match your Apache Tomcat v10.1 export
FROM tomcat:10.1-jdk17-openjdk

# Remove default apps
RUN rm -rf /usr/local/tomcat/webapps/*

# This line MUST match your file name: TailorShop.war
COPY target/TailorShop.war /usr/local/tomcat/webapps/ROOT.war

EXPOSE 8080
CMD ["catalina.sh", "run"]