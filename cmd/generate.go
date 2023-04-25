package cmd

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path"
	"time"

	"github.com/google/uuid"
	"github.com/spf13/cobra"
	"gopkg.in/yaml.v2"

	"github.com/ksoclabs/kbom/internal/config"
	"github.com/ksoclabs/kbom/internal/kube"
	"github.com/ksoclabs/kbom/internal/model"
	"github.com/ksoclabs/kbom/internal/utils"
)

const (
	KSOCCompany = "KSOC Labs"
	BOMFormat   = "ksoc"
	SpecVersion = "0.1"

	StdOutput  = "stdout"
	FileOutput = "file"

	JSONFormat = "json"
	YAMLFormat = "yaml"
)

var (
	short   bool
	output  string
	format  string
	outPath string
)

var GenerateCmd = &cobra.Command{
	Use:   "generate",
	Short: "Generate KBOM for the provided K8s cluster",
	RunE:  runGenerate,
}

func init() {
	GenerateCmd.Flags().BoolVar(&short, "short", false, "Short - only include metadata, nodes, images and resources counters")
	GenerateCmd.Flags().StringVarP(&output, "output", "o", StdOutput, "Output (stdout, file)")
	GenerateCmd.Flags().StringVarP(&format, "format", "f", JSONFormat, "Format (json, yaml)")
	GenerateCmd.Flags().StringVarP(&outPath, "out-path", "p", ".", "Path to write KBOM to")

	utils.BindFlags(GenerateCmd)
}

func runGenerate(cmd *cobra.Command, _ []string) error {
	ctx := context.Background()

	k8sClient, err := kube.NewClient()
	if err != nil {
		return err
	}

	k8sVersion, caCertDigest, err := k8sClient.Metadata(ctx)
	if err != nil {
		return err
	}

	full := !short
	nodes, err := k8sClient.AllNodes(ctx, full)
	if err != nil {
		return err
	}

	loc, err := k8sClient.Location(ctx)
	if err != nil {
		return err
	}

	allImages, err := k8sClient.AllImages(ctx)
	if err != nil {
		return err
	}

	resources, err := k8sClient.AllResources(ctx, full)
	if err != nil {
		return err
	}

	kbom := model.KBOM{
		ID:          uuid.New().String(),
		BOMFormat:   BOMFormat,
		SpecVersion: SpecVersion,
		GeneratedAt: time.Now(),
		GeneratedBy: model.Tool{
			Vendor:     KSOCCompany,
			BuildTime:  config.BuildTime,
			Name:       config.AppName,
			Version:    config.AppVersion,
			Commit:     config.LastCommitHash,
			CommitTime: config.LastCommitTime,
		},
		Cluster: model.Cluster{
			Location:     *loc,
			CNIVersion:   "", // TODO: get CNI version
			K8sVersion:   k8sVersion,
			CACertDigest: caCertDigest,
			NodesCount:   len(nodes),
			Nodes:        nodes,
			Resources: model.Resources{
				Images:    allImages,
				Resources: resources,
			},
		},
	}

	if err := printKBOM(&kbom); err != nil {
		return err
	}

	return nil
}

func printKBOM(kbom *model.KBOM) error {
	writer, err := getWriter(kbom)
	if err != nil {
		return err
	}
	defer writer.Close()

	switch format {
	case JSONFormat:
		enc := json.NewEncoder(writer)
		enc.SetIndent("", "  ")
		if err := enc.Encode(kbom); err != nil {
			return err
		}
	case YAMLFormat:
		enc := yaml.NewEncoder(writer)
		if err := enc.Encode(kbom); err != nil {
			return err
		}
	default:
		return fmt.Errorf("format %q is not supported", format)
	}

	return nil
}

func getWriter(kbom *model.KBOM) (*os.File, error) {
	switch output {
	case StdOutput:
		return os.Stdout, nil
	case FileOutput:
		formattedTime := kbom.GeneratedAt.Format("2006-01-02-15-04-05")
		key := kbom.ID[:8]
		if len(kbom.Cluster.CACertDigest) > 8 {
			key = kbom.Cluster.CACertDigest[:8]
		}

		f, err := os.Create(path.Join(outPath, fmt.Sprintf("kbom-%s-%s.%s", key, formattedTime, format)))
		if err != nil {
			return nil, err
		}

		return f, nil
	default:
		return nil, fmt.Errorf("output %q is not supported", output)
	}
}