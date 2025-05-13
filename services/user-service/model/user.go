package model

import "go.mongodb.org/mongo-driver/bson/primitive"


type User struct {

	Id			primitive.ObjectID		`json:"id" bson:"_id,omitempty"`			
	Name		string					`json:"name" validate:"required"`
	Email		string					`json:"email" validate:"required,email"`
	Password	string					`json:"password" validate:"required,min=8"`
	Avatar		string					`json:"avatar" validate:"required"`

}