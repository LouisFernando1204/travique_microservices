FROM golang:1.24

WORKDIR /app 

RUN go mod download 

COPY go.mod go.sum ./ 

RUN go build -o main main.go 

EXPOSE 8080

CMD [ "./main" ]