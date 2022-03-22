OPTIONS=$(go tool dist list)
for OPTION in $OPTIONS; do
  # go test -v -coverprofile=coverage.out $i
  echo $OPTION
done