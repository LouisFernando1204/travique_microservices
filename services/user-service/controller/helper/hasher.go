package helper

import "golang.org/x/crypto/bcrypt"

func HashPassword(pass string) (string, error) {

	hashedPass, err := bcrypt.GenerateFromPassword([]byte(pass), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	return string(hashedPass), nil

}

func CheckPassword(hashedPass string, pass string) error {

	return bcrypt.CompareHashAndPassword([]byte(hashedPass), []byte(pass))
	
}