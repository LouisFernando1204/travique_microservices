package helper

import (
	"context"

	"github.com/yebology/travique-go/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetSpecificUser(ctx context.Context, filter bson.M, collection *mongo.Collection) (model.User, error) {

	var user model.User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		return model.User{}, err
	}

	return user, nil

}