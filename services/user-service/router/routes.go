package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/yebology/travique-go/controller"
	"github.com/yebology/travique-go/controller/helper"
	"github.com/yebology/travique-go/middleware"
)

func SetUp(app *fiber.App) {

	app.Post("/api/auth/register", controller.Register)

	app.Post("/api/auth/login", controller.Login)

	app.Patch("/api/auth/edit_profile/:id", controller.EditProfile)

	app.Get("/api/health", helper.GetApiHealth)

	app.Get("/api/auth/verify_token/:id", middleware.Auth)

}