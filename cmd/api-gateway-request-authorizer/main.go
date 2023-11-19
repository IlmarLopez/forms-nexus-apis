package main

import (
	"context"

	"github.com/aws/aws-lambda-go/lambda"
)

// Define the request structure expected by API Gateway
type APIGatewayCustomAuthorizerRequest struct {
	Type               string `json:"type"`
	AuthorizationToken string `json:"authorizationToken"`
	MethodArn          string `json:"methodArn"`
}

// Define the response structure
type APIGatewayCustomAuthorizerResponse struct {
	PrincipalID    string                           `json:"principalId"`
	PolicyDocument APIGatewayCustomAuthorizerPolicy `json:"policyDocument"`
}

type APIGatewayCustomAuthorizerPolicy struct {
	Version   string                                `json:"Version"`
	Statement []APIGatewayCustomAuthorizerStatement `json:"Statement"`
}

type APIGatewayCustomAuthorizerStatement struct {
	Action   string `json:"Action"`
	Effect   string `json:"Effect"`
	Resource string `json:"Resource"`
}

func handleRequest(ctx context.Context, request APIGatewayCustomAuthorizerRequest) (APIGatewayCustomAuthorizerResponse, error) {
	// Check the token value
	token := request.AuthorizationToken

	if token == "test" {
		return generatePolicy("user", "Allow", request.MethodArn), nil
	}

	return generatePolicy("user", "Deny", request.MethodArn), nil
}

func generatePolicy(principalID, effect, resource string) APIGatewayCustomAuthorizerResponse {
	authResponse := APIGatewayCustomAuthorizerResponse{
		PrincipalID: principalID,
		PolicyDocument: APIGatewayCustomAuthorizerPolicy{
			Version: "2012-10-17",
			Statement: []APIGatewayCustomAuthorizerStatement{
				{
					Action:   "execute-api:Invoke",
					Effect:   effect,
					Resource: resource,
				},
			},
		},
	}

	return authResponse
}

func main() {
	lambda.Start(handleRequest)
}
