package helper

import (
	"github.com/gofiber/fiber/v2"
	"github.com/yebology/travique-go/output"
)

func GetApiHealth(c *fiber.Ctx) error {

	return output.GetSuccess(c, "Status OK!", nil)

}