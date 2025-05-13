package jwt

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/gofiber/fiber/v2"
	"github.com/yebology/travique-go/model"
)

func ParseToken(c *fiber.Ctx) (jwt.MapClaims, error) {

	token := c.Get("Authorization")
	claims := jwt.MapClaims{}

	parsedToken, err := jwt.ParseWithClaims(token, claims, GetSecretKey)
	if err != nil || !parsedToken.Valid {
		return nil, err
	}

	return claims, nil

}

func GetSecretKey(token *jwt.Token) (interface{}, error) {

	return []byte("secret-key"), nil

}

func GenerateJwt(user model.User) (string, error) {

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id": user.Id,
		"email": user.Email,
		"name": user.Name,
	})

	signed, err := token.SignedString([]byte("secret-key"))
	if err != nil {
		return "", err
	}

	return signed, nil
	
}