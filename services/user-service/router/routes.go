package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/yebology/travique-go/controller"
	"github.com/yebology/travique-go/controller/helper"
	"github.com/yebology/travique-go/middleware"
)

func SetUp(app *fiber.App) {

	app.Post("/api/register", controller.Register)

	app.Post("/api/login", controller.Login)

	app.Patch("/api/edit_profile/:id", middleware.Auth, controller.EditProfile)

	app.Get("/api/health", helper.GetApiHealth)

}