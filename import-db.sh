# inside docker
mongoimport --authenticationDatabase=admin  --username=admin --password=password  --db=omnicritic --collection=titles --type=csv --headerline --file=omnicritic-titles.csv

# host
docker exec -i colonel-mongo-1 sh -c 'exec mongoimport --authenticationDatabase=admin  --username=admin --password=password  --db=omnicritic --collection=titles --type=csv --headerline --file=' < ~/Downloads/omnicritic-titles.csv