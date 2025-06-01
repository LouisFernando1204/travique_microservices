package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/yebology/travique-go/config"
	"github.com/yebology/travique-go/middleware"
	"github.com/yebology/travique-go/router"
)

func main() {
	
	app := fiber.New()

	config.ConnectDatabase()

	defer config.DisconnectDatabase()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "*",
	}))

	app.Use(middleware.CheckDbConnection)

	router.SetUp(app)

	log.Fatal(app.Listen(":8080"))

}