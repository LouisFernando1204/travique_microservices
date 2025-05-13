package output

import "github.com/gofiber/fiber/v2"

func GetError(c *fiber.Ctx, status int, err string) error {

	return c.Status(status).JSON(fiber.Map{
		"message": err,
		"data": "",
	})
	
}

func GetSuccess(c *fiber.Ctx, data fiber.Map) error {
	
	return c.Status(fiber.StatusOK).JSON(data)

}