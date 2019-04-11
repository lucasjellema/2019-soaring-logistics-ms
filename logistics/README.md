# Logistics Application

## Building the application

At this moment, the application is deployed in a Docker image that is derived from a generic Docker Node image that downloads a Node application from GitHub, installs npm dependencies and runs the application. That means that the manual build process is performed in these steps:

1. commit and push all to GitHub
2. in local Linux Vagrant Box
```
docker run --name logistics-ms -p 3016:3001 -p 4500:4500  -e APPLICATION_ROOT_DIRECTORY=logistics-ms -e APP_PORT=3001 -e GITHUB_URL=https://github.com/lucasjellema/logistics-microservice-soaring-clouds-sequel --rm -d lucasjellema/node-run-live-reload:0.4.3
```
3. check in logging to see if container is fully initialied
```
docker logs logistics-ms --follow
```
4. optionally test locally on laptop
http://192.168.188.142:3016/about

5. when container is ready, save the container as a new image
```
docker commit -m "reloadable logistics ms"  logistics-ms soaring-logistics-ms
```

6. Login to Docker Hub
```
docker login
```

7. tag image

```
docker tag soaring-logistics-ms lucasjellema/soaring-logistics-ms:1.0
```

8. push image to Docker Hub
```
docker push lucasjellema/soaring-logistics-ms:1.0
```

9. Stop container
```
docker stop logistics-ms
```

This creates an image on Docker Hub that contains the dependencies for the Soaring Logistics MS - including Node and the sources from GitHub https://github.com/lucasjellema/logistics-microservice-soaring-clouds-sequel



After the push, the Kubernetes deployment can be done - or repeated (see next section)

Quick action:
```
docker run --name logistics-ms -p 3016:3001 -p 4500:4500  -e APPLICATION_ROOT_DIRECTORY=logistics-ms -e APP_PORT=3001 -e GITHUB_URL=https://github.com/lucasjellema/logistics-microservice-soaring-clouds-sequel --rm -d lucasjellema/node-run-live-reload:0.4.3
docker logs logistics-ms --follow
docker commit -m "reloadable logistics ms"  logistics-ms soaring-logistics-ms
docker tag soaring-logistics-ms lucasjellema/soaring-logistics-ms:1.0
docker push lucasjellema/soaring-logistics-ms:1.0
docker stop logistics-ms
```



## Deploy application

Prequisites:
* soaring-clouds namespace exists in k8s cluster
* Elastic Search indexes have been created
* logisticsms-deployment.yml is configured according to the context (Elastic Search endpoint, Kafka endpoint & topic names)

To Create Elastic Search indexes
Use node script model\prepareElasticIndexes.js

make sure to set the environment variable ELASTIC_CONNECTOR before running this script

set ELASTIC_CONNECTOR=minikube_ip:ingress_port/soaring/elastic
node model/prepareElasticIndexes.js

```
kubectl apply -f ../logistics/k8s/logisticsms-ingress.yml
kubectl apply -f ../logistics/k8s/logisticsms-service.yml
kubectl apply -f ../logistics/k8s/logisticsms-deployment.yml
```

To replace the deployment when the image has been rebuilt:
at least this works.
perhaps deleting the pod(s) is enough - as this will result in image reload?!
```
kubectl delete -f ../logistics/k8s/logisticsms-deployment.yml
kubectl apply -f ../logistics/k8s/logisticsms-deployment.yml
```

Note: Logistics MS has two dependencies on Kafka
- outbound to the Shipping News Topic
- outbound on KAFKA_SHIPMENT_PICKED_TOPIC - to publish the order picked event (relevant for shipper's market)
If these topics do not exist, Logistics MS will still process shippings (pick them, deliver them, ...)

Configure the deployment for:
- KAFKA_HOST endpoint (for publishing shipping news events)
- SOARING_SHIPPINGNEWS_TOPIC_NAME - the name of the Kafka Topic where shippingnews is published
- GITHUB_URL the GitHub Repo repo where the application is located (for now I a using the generic Node runner application)
- SCHEMA_REGISTRY - the endpoint for the Kafka Schema registry - for Avro event consumption
- KAFKA_SHIPMENT_PICKED_TOPIC - the name of Kafka Topic to which order picked event is published
- ELASTIC_CONNECTOR - the endpoint for an Elastic Search instance where indexes can be created. Note this endpoint will have to be updated for minikube environments


Note: with deployment on OKE, the DNS to external hosts does not work well. Therefore, the IP adresses for several hosts are made available inside the Pods via the hostAlias definitions.


You can check the deployment of Logistics Application at:

http://K8S-Cluster-IP[:port at which ingress is accessed]/soaring/logistics/about
