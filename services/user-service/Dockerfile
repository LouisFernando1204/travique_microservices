FROM golang:1.24

WORKDIR /app 

COPY go.mod go.sum ./ 

RUN go mod download 

COPY . .

RUN go build -o main main.go 

EXPOSE 7100

CMD [ "./main" ]