package database

import (
	"context"
	"log"
	"os"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client

func GetDatabase() *mongo.Database {

	if Client == nil {
		log.Fatalf("MongoDB is not initialized!")
	}

	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Cannot load .env! %s", err)
	}

	DB_NAME := os.Getenv("DB_NAME")

	return Client.Database(DB_NAME)

}

func ConnectDatabase() {

	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Cannot load .env! %s", err)
	}

	MONGO_URI := os.Getenv("MONGO_URI")
	clientOption := options.Client().ApplyURI(MONGO_URI)

	client, err := mongo.Connect(context.Background(), clientOption)
	if err != nil {
		log.Fatalf("Error while connect to MongoDB! %s", err)
	}
	Client = client

	err = Client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatalf("Error while ping to MongoDB! %s", err)
	}

	log.Println("Successfully connected to MongoDB!")

}

func DisconnectDatabase() {

	if Client == nil {
		log.Fatalf("MongoDB is not initialized!")
	}

	err := Client.Disconnect(context.Background())
	if err != nil {
		log.Fatalf("Error while disconnect from MongoDB!")
	}

	log.Println("Successfully disconnected to MongoDB!")
	
}