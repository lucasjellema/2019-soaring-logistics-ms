# Event Monitor

The Event Monitor consumes messages from a number of Kafka Topics. The names of these topics are currently hard coded in soaring-avro-event-consumer.js. The KAFKA environment is configured through environment variables KAFKA_HOST. The code currently assumes (hard coded) port 9092 for the Kafka Broker. For Avro style messages, a Kafka Schema registry is leveraged for decoding the messages to JavaScript objects. The endpoint for the Schema Registry is passed through the environment variable SCHEMA_REGISTRY (a full URL, like http://130.22.11.14:8081)

The consumed messages are recorded in Elastic Search indexes that have the same name as the topic from which the message was consumsed. The Elastic Search environment is indicated through the environment variable ELASTIC_CONNECTOR. 

The Event Monitor performs specific actions for some topics (this is coded in index.js):
- soaring-products : product events are processed and a collection of products is synchronized (CQRS style) in Elastic Search index soaringeventsproduct, hard coded in model.js
- soaring-shipmentpickedup and soaring-shipmentreceived : published  by the Shippers' market to indicate that a shipment was collected or delivered to the customer. The shipment document in the Elastic Search index is updated with this information
- soaring-ordercreated: this event signals the submission by a customer of a new order; the orderCreatedEventProcessor (process-order-created-event.js) responds to this event with the creation of a new Shipping document, that is subsequently processed. 

Note: the reaction to soaring-ordercreated, soaring-shipmentpickedup and soaring-shipmentreceived involves a call to the Logistics MS service; the endpoint for this service/API is passed in the environment variable LOGISTICS_MS_API_ENDPOINT.

In case an order must be canceled because the order as it is defined in the order created event does not pass validation, the event monitor attempts to call the cancel operation on the Orders MS API. The endpoint for this API is passed in the environment variable ORDERS_MS_API_ENDPOINT. 


## Building the application

At this moment, the application is deployed in a Docker image that is derived from a generic Docker Node image. The Docker file can be used to rebuild the container.

For smaller changes, the following shortcut build procedure can be used as well

1. commit and push all to GitHub
2. in local Linux Vagrant Box
```
docker run --name soaring-avro-event-monitor   -p 8099:8099 -e KAFKA_AVRO_LOG_LEVEL=info --rm -d lucasjellema/soaring-avro-event-monitor:1.0.1
```

3. open a terminal window inside the container:
```
docker exec -it soaring-avro-event-monitor /bin/sh
```

4. refresh the application sources from the latest git commits:
```
git pull
```
or copy files into the container with `docker cp`

5. recreate (tag and commit and push) the container
```
docker commit -m "soaring-avro-event-monitor"  soaring-avro-event-monitor soaring-avro-event-monitor
docker tag soaring-avro-event-monitor lucasjellema/soaring-avro-event-monitor:1.0.1
docker push lucasjellema/soaring-avro-event-monitor:1.0.1
```

6. stop and remove the local container
```
docker stop soaring-avro-event-monitor
```
(no `docker rm` is needed because the container was started with the --rm option )


After the push, the Kubernetes deployment can be done - or repeated (see next section)



## Deploy application

Prequisites:
* soaring-clouds namespace exists in k8s cluster
* kafka topics are setup
* logistics ms has been deployed 
* topic names are configured in soaring-avro-event-consumer.js
* all sources are committed to GitHub and the container has been built based on these latest sources
* ..-deployment.yml is configured according to the context (Elastic Search endpoint, Logistics MS endpoint,  Kafka endpoint & topic names, Kafka Schema Registry endpoint)


```
kubectl apply -f event-monitor/k8s
```

To replace the deployment when the image has been rebuilt:
at least this works.
perhaps deleting the pod(s) is enough - as this will result in image reload?!
```
kubectl delete -f event-monitor/k8s/soaring-avro-event-monitor-deployment.yml
kubectl apply -f event-monitor/k8s/soaring-avro-event-monitor-deployment.yml
```

The successful deployment of the Event Monitor can be checked at the endpoint:

<K8S Cluster/Loadbalancer IP>/soaring/avroeventmonitor/about
or on Minikube
<Minikube IP>:<port assigned to Traefik Ingress Controller>/soaring/avroeventmonitor/about (for example http://192.168.99.106:31839/soaring/avroeventmonitor/about)


