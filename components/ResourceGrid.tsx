import type { ResourceItem } from "@/lib/resources";
import PhosphorIcon from "./PhosphorIcon";

export default function ResourceGrid({ resources }: { resources: ResourceItem[] }) {
  return (
    <div className="resource-grid">
      {resources.map((resource) => (
        <a
          key={resource.id}
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="resource-card"
        >
          <div className="resource-card-heading">
            <h3>
              {resource.title}
            </h3>
            <PhosphorIcon name="ArrowUpRight" size={17} aria-hidden="true" />
          </div>
          <p>{resource.description}</p>
          <div className="resource-meta" aria-label="Datos del recurso">
            <span>{resource.kind}</span>
            <span>{resource.level}</span>
            <span>{resource.language}</span>
            {resource.certificate && (
              <span className="is-certificate">
                <PhosphorIcon name="Certificate" size={13} weight="bold" aria-hidden="true" />
                Certificado
              </span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
