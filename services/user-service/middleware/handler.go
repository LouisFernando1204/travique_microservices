package middleware

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/yebology/travique-go/config"
	"github.com/yebology/travique-go/constant"
	"github.com/yebology/travique-go/controller/helper"
	"github.com/yebology/travique-go/jwt"
	"github.com/yebology/travique-go/output"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func Auth(c *fiber.Ctx) error {
	
	ctx, cancel := context.WithTimeout(context.Background(), 5 * time.Second)
	defer cancel()

	paramId := c.Params("id")

	claims, err := jwt.ParseToken(c)
	if err != nil {
		return output.GetError(c, fiber.StatusUnauthorized, string(constant.InvalidTokenError))
	}

	userId, ok := claims["id"].(string)
	if !ok || userId != paramId {
		return output.GetError(c, fiber.StatusForbidden, string(constant.PermissionDeniedError))
	}

	userObjId, err := primitive.ObjectIDFromHex(paramId)
	if err != nil {
		return output.GetError(c, fiber.StatusBadRequest, string(constant.FailedToParseData))
	}

	collection := config.GetDatabase().Collection("user")
	filter := bson.M{
		"_id": userObjId,
	}

	user, err := helper.GetSpecificUser(ctx, filter, collection)
	if err != nil {
		return output.GetError(c, fiber.StatusBadRequest, string(constant.InvalidAccountError))
	}

	return output.GetSuccess(c, string(constant.AuthenticationSuccessful), fiber.Map{
		"user": user,
	})

}