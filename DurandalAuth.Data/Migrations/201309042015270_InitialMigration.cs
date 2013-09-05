namespace DurandalAuth.Data.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class InitialMigration : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.DurandalAuth_Articles",
                c => new
                    {
                        ArticleId = c.Guid(nullable: false),
                        Title = c.String(nullable: false, maxLength: 200),
                        UrlCodeReference = c.String(maxLength: 200),
                        Description = c.String(nullable: false, maxLength: 500),
                        ImageUrl = c.String(nullable: false, maxLength: 500),
                        Markdown = c.String(),
                        Html = c.String(),
                        IsPublished = c.Boolean(nullable: false),
                        CategoryId = c.Guid(nullable: false),
                        CreatedDate = c.DateTime(nullable: false),
                        UpdatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdatedBy = c.String(),
                        RowVersion = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.ArticleId)
                .ForeignKey("dbo.DurandalAuth_Categories", t => t.CategoryId)
                .Index(t => t.CategoryId);

            CreateIndex("dbo.DurandalAuth_Articles", "UrlCodeReference"); // Important to keep this Index creation !!

            CreateTable(
                "dbo.DurandalAuth_Categories",
                c => new
                    {
                        CategoryId = c.Guid(nullable: false),
                        Name = c.String(maxLength: 100),
                    })
                .PrimaryKey(t => t.CategoryId);
            
            CreateTable(
                "dbo.DurandalAuth_Tags",
                c => new
                    {
                        TagId = c.Guid(nullable: false),
                        Name = c.String(nullable: false, maxLength: 100),
                        ArticleId = c.Guid(nullable: false),
                    })
                .PrimaryKey(t => t.TagId)
                .ForeignKey("dbo.DurandalAuth_Articles", t => t.ArticleId)
                .Index(t => t.ArticleId);
            
            CreateTable(
                "dbo.DurandalAuth_UserProfiles",
                c => new
                    {
                        UserProfileId = c.Int(nullable: false, identity: true),
                        UserName = c.String(nullable: false, maxLength: 50),
                        Email = c.String(nullable: false, maxLength: 200),
                    })
                .PrimaryKey(t => t.UserProfileId);
            
        }
        
        public override void Down()
        {
            DropIndex("dbo.DurandalAuth_Tags", new[] { "ArticleId" });
            DropIndex("dbo.DurandalAuth_Articles", new[] { "CategoryId" });
            DropIndex("dbo.DurandalAuth_Articles", new[] { "UrlCodeReference" }); // Important to keep this Index drop !!
            DropForeignKey("dbo.DurandalAuth_Tags", "ArticleId", "dbo.DurandalAuth_Articles");
            DropForeignKey("dbo.DurandalAuth_Articles", "CategoryId", "dbo.DurandalAuth_Categories");
            DropTable("dbo.DurandalAuth_UserProfiles");
            DropTable("dbo.DurandalAuth_Tags");
            DropTable("dbo.DurandalAuth_Categories");
            DropTable("dbo.DurandalAuth_Articles");
        }
    }
}
