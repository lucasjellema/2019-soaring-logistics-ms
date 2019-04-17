# Kibana

## Run Kibana on the same Kubernetes Cluster as Elastic Search

Elastic Search was deployed on the Kubernetes cluster using the files in ..\elastic. To run Kibana on the same Kubernetes Cluster and connect to that Elastic Search environment, run the following files:

kubectl apply -f kibana\05-kibana-cm.yml
kubectl apply -f kibana\06-kibana-svc.yml
kubectl apply -f kibana\08-kibana-deployment.yml
kubectl apply -f kibana\09-kibana-ingress.yml


## Running Kibana outside Kubernetes cluster
Kibana can be run anywhere and still connect to our Elastic Search instance:

To run Kibana on Minikube:

docker run -d   --name=kibana   -p 5601:5601   -e ELASTICSEARCH_URL=http://<K8S Cluser IP[:port]>/soaring/elastic  docker.elastic.co/kibana/kibana-oss:6.2.4

this also works in Katacoda


Need to export/import or simply recreate the Index Patterns manually

Note: here does not seem to be direct references to Index Patterns in the exported dashboard

