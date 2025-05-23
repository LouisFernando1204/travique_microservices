package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/yebology/travique-go/constant"
	"github.com/yebology/travique-go/jwt"
	"github.com/yebology/travique-go/output"
)

func Auth(c *fiber.Ctx) error {

	paramId := c.Params("id")

	claims, err := jwt.ParseToken(c)
	if err != nil {
		return output.GetError(c, fiber.StatusUnauthorized, string(constant.InvalidTokenError))
	}

	userId, ok := claims["id"].(string)
	if !ok || userId != paramId {
		return output.GetError(c, fiber.StatusForbidden, string(constant.PermissionDeniedError))
	}

	return output.GetSuccess(c, "Authentication successful!", nil)

}