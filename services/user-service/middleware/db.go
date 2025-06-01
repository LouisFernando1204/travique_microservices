package middleware

import (
	"context"

	"github.com/gofiber/fiber/v2"
	"github.com/yebology/travique-go/config"
	"github.com/yebology/travique-go/constant"
	"github.com/yebology/travique-go/output"
)

func CheckDbConnection(c *fiber.Ctx) error {
	
	if config.Client == nil {
		return output.GetError(c, fiber.StatusInternalServerError, string(constant.DatabaseNotInitialized))
	}

	err := config.Client.Ping(context.Background(), nil)
	if err != nil {
		return output.GetError(c, fiber.StatusInternalServerError, string(constant.ErrorWhilePingToDatabase))
	}

	return c.Next()
	
}