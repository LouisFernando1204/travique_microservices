package constant

import "github.com/go-playground/validator/v10"

var validate = validator.New()

func GetValidator() *validator.Validate {
	return validate
}