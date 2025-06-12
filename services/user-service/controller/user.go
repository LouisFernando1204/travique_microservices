package controller

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/yebology/travique-go/config"
	"github.com/yebology/travique-go/constant"
	"github.com/yebology/travique-go/controller/helper"
	"github.com/yebology/travique-go/data"
	"github.com/yebology/travique-go/jwt"
	"github.com/yebology/travique-go/model"
	"github.com/yebology/travique-go/output"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func Register(c *fiber.Ctx) error {

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user model.User
	err := c.BodyParser(&user)
	if err != nil {
		return output.GetError(c, fiber.StatusBadRequest, string(constant.FailedToParseData))
	}

	err = constant.GetValidator().Struct(user)
	if err != nil {
		return output.GetError(c, fiber.StatusBadRequest, string(constant.ValidationError))
	}

	hashedPass, err := helper.HashPassword(user.Password)
	if err != nil {
		return output.GetError(c, fiber.StatusBadRequest, string(constant.FailedToHashPassword))
	}
	user.Password = hashedPass

	collection := config.GetDatabase().Collection("user")
	filter := bson.M{
		"email": user.Email,
	}

	_, err = helper.GetSpecificUser(ctx, filter, collection)
	if err == nil {
		return output.GetError(c, fiber.StatusBadRequest, string(constant.DuplicateDataError))
	}

	_, err = collection.InsertOne(ctx, user)
	if err != nil {
		return output.GetError(c, fiber.StatusBadRequest, string(constant.FailedToInsertData))
	}

	specificUser, err := helper.GetSpecificUser(ctx, filter, collection)
	if err != nil {
		return output.GetError(c, fiber.StatusBadRequest, string(constant.FailedToLoadUserData))
	}

	jwt, err := jwt.GenerateJwt(specificUser)
	if err != nil {
		return output.GetError(c, fiber.StatusBadRequest, string(constant.FailedToGenerateTokenAccess))
	}

	return output.GetSuccess(c, "Registration Successful!", fiber.Map{
		"user": specificUser,
		"jwt": jwt,
	})

}

func Login(c *fiber.Ctx) error {

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var loginData data.Login
	err := c.BodyParser(&loginData)
	if err != nil {
		return output.GetError(c, fiber.StatusBadRequest, string(constant.FailedToParseData))
	}

	err = constant.GetValidator().Struct(loginData)
	if err != nil {
		return output.GetError(c, fiber.StatusBadRequest, string(constant.ValidationError))
	}

	collection := config.GetDatabase().Collection("user")
	filter := bson.M{
		"email": loginData.Email,
	}

	specificUser, err := helper.GetSpecificUser(ctx, filter, collection)
	if err != nil {
		return output.GetError(c, fiber.StatusBadRequest, string(constant.InvalidAccountError))
	}

	err = helper.CheckPassword(specificUser.Password, loginData.Password)
	if err != nil {
		return output.GetError(c, fiber.StatusBadRequest, string(constant.InvalidAccountError))
	}
	 
	jwt, err := jwt.GenerateJwt(specificUser)
	if err != nil {
		return output.GetError(c, fiber.StatusBadRequest, string(constant.FailedToGenerateTokenAccess))
	}

	return output.GetSuccess(c, "Login Successfully!", fiber.Map{
		"user": specificUser,
		"jwt": jwt,
	})

}

func EditProfile(c *fiber.Ctx) error {

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	id := c.Params("id")

	var user model.User
	err := c.BodyParser(&user)
	if err != nil {
		return output.GetError(c, fiber.StatusBadRequest, string(constant.FailedToParseData))
	}

	err = constant.GetValidator().Struct(user)
	if err != nil {
		return output.GetError(c, fiber.StatusBadRequest, string(constant.ValidationError))
	}

	userId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return output.GetError(c, fiber.StatusBadRequest, string(constant.FailedToParseData))
	}

	pass, err := helper.HashPassword(user.Password)
	if err != nil {
		return output.GetError(c, fiber.StatusBadRequest, string(constant.FailedToHashPassword))
	}

	user.Password = pass

	collection := config.GetDatabase().Collection("user")
	filter := bson.M{
		"_id": userId,
	}
	update := bson.M{
		"$set": user,
	}

	_, err = collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return output.GetError(c, fiber.StatusBadRequest, string(constant.FailedToUpdateData))
	}

	return output.GetSuccess(c, "Profile edited successfully!", fiber.Map{
		"user": user,
	})

}