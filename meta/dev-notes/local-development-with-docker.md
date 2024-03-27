
### Running

Simply run

```
docker compose up
```

Server now should be running on `localhost:8540`.

Client now should be running on `localhost:8545`.

As a side-effect, mongo server will be running on `localhost:27017`.

Also, to run in detached mode:

```
docker compose up -d
```

### To Stop

```
docker compose down
```

### To Remove All Docker Artefacts

```
docker compose down --rmi all
```




